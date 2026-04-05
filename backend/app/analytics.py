from __future__ import annotations

from functools import lru_cache
from typing import Any

import pandas as pd

from .domain import (
    FEATURE_FAMILY_DESCRIPTIONS,
    classify_dtype,
    root_signature,
    safe_float,
    token_overlap,
    top_n_categories,
    to_serializable,
)
from .repository import repository


def _numeric_distribution(series: pd.Series) -> dict[str, Any]:
    clean = pd.to_numeric(series, errors="coerce").dropna()
    if clean.empty:
        return {
            "kind": "numeric",
            "min": None,
            "max": None,
            "mean": None,
            "median": None,
            "std": None,
            "skewness": None,
            "kurtosis": None,
            "iqr": None,
            "outlier_candidate_flag": False,
        }

    q1 = clean.quantile(0.25)
    q3 = clean.quantile(0.75)
    iqr = q3 - q1
    return {
        "kind": "numeric",
        "min": safe_float(clean.min()),
        "max": safe_float(clean.max()),
        "mean": safe_float(clean.mean()),
        "median": safe_float(clean.median()),
        "std": safe_float(clean.std()),
        "skewness": safe_float(clean.skew()),
        "kurtosis": safe_float(clean.kurtosis()),
        "iqr": safe_float(iqr),
        "outlier_candidate_flag": bool(iqr > 0 and ((clean > (q3 + 1.5 * iqr)).mean() > 0.01)),
    }


def _categorical_distribution(series: pd.Series) -> dict[str, Any]:
    values = series.fillna("Missing").astype(str)
    counts = values.value_counts(dropna=False)
    total = max(len(values), 1)
    top_value = counts.index[0] if not counts.empty else None
    rare_threshold = max(2, int(total * 0.01))
    rare_count = int((counts < rare_threshold).sum())
    return {
        "kind": "categorical",
        "top_category": top_value,
        "top_category_share": safe_float(counts.iloc[0] / total) if not counts.empty else None,
        "rare_label_count": rare_count,
        "cardinality_class": _cardinality_class(int(counts.size)),
        "top_categories": top_n_categories(series, limit=8).to_dict("records"),
    }


def _cardinality_class(unique_count: int) -> str:
    if unique_count <= 2:
        return "binary"
    if unique_count <= 10:
        return "low"
    if unique_count <= 25:
        return "medium"
    if unique_count <= 100:
        return "high"
    return "very_high"


def _structural_stats(series: pd.Series) -> dict[str, Any]:
    non_null = series.notna().sum()
    total = max(len(series), 1)
    zero_count = int((pd.to_numeric(series, errors="coerce") == 0).sum())
    return {
        "missing_count": int(series.isna().sum()),
        "missing_pct": safe_float(series.isna().mean()),
        "zero_count": zero_count,
        "zero_pct": safe_float(zero_count / total),
        "unique_count": int(series.nunique(dropna=True)),
        "unique_ratio": safe_float(series.nunique(dropna=True) / max(non_null, 1)),
    }


def _audit_flags(catalog_row: dict, structural_stats: dict, distribution: dict) -> list[dict]:
    flags = [
        {"label": "High missing", "active": (structural_stats["missing_pct"] or 0) >= 0.5},
        {"label": "Zero heavy", "active": (structural_stats["zero_pct"] or 0) >= 0.4},
        {
            "label": "Skewed",
            "active": abs(distribution.get("skewness") or 0) >= 1.0
            if distribution["kind"] == "numeric"
            else False,
        },
        {
            "label": "Outlier-prone",
            "active": bool(distribution.get("outlier_candidate_flag", False)),
        },
        {
            "label": "High cardinality",
            "active": bool(catalog_row.get("high_cardinality_flag"))
            or bool(catalog_row.get("very_high_cardinality_flag")),
        },
        {
            "label": "Redundant family candidate",
            "active": catalog_row.get("feature_family") == "Housing Features"
            and (structural_stats["missing_pct"] or 0) >= 0.3,
        },
    ]
    return flags


def _transformation_recommendation(catalog_row: dict, distribution: dict) -> str:
    if distribution["kind"] != "numeric":
        return "No numeric transformation needed. Focus on rare-category grouping and stable encoding."
    skewness = abs(distribution.get("skewness") or 0)
    minimum = distribution.get("min")
    if skewness >= 2 and minimum is not None and minimum >= 0:
        return "Consider log1p plus upper-tail clipping. The distribution is strongly skewed and non-negative."
    if skewness >= 1:
        return "Consider quantile clipping or winsorization before model training."
    return "The distribution looks stable enough for light scaling or direct model use."


def _feature_engineering_note(catalog_row: dict) -> str:
    family = catalog_row["feature_family"]
    column = catalog_row["column"]
    if family == "Historical Aggregated Features":
        return "Treat missingness as potential absence of prior history before deciding on imputation. Compare this feature with sibling history aggregates."
    if family == "Ratio Features":
        return "This column is already ratio-like. Compare it with the raw amount columns it summarizes to check redundancy and stability."
    if family == "Housing Features":
        return "Check sibling AVG/MEDI/MODE features or grouped housing bundles before keeping this as a standalone signal."
    if "EXT_SOURCE" in column:
        return "External source signals are high-priority. Compare this with other EXT_SOURCE fields and aggregate bundles."
    if family == "Social / Inquiry Features":
        return "Pair this with target-rate visualizations because inquiry and social pressure features can be sparse but informative."
    return "Use this column in the context of its family and compare it with burden ratios or target-rate views."


def _decision_recommendation(catalog_row: dict, structural_stats: dict, distribution: dict) -> str:
    if bool(catalog_row.get("constant_flag")) or bool(catalog_row.get("potential_id_flag")):
        return "Drop"
    if (structural_stats["missing_pct"] or 0) >= 0.8 and catalog_row["feature_family"] != "Historical Aggregated Features":
        return "Review"
    if distribution["kind"] == "categorical" and distribution.get("cardinality_class") == "very_high":
        return "Review"
    return "Keep"


def build_related_columns(column: str, limit: int = 12) -> list[dict]:
    catalog = repository.columns_catalog
    target_row = repository.get_catalog_row(column)
    family = target_row["feature_family"]
    signature = root_signature(column)

    candidates = []
    for row in catalog.to_dict("records"):
        candidate = row["column"]
        if candidate == column:
            continue
        score = 0
        if row["feature_family"] == family:
            score += 2
        if root_signature(candidate) == signature:
            score += 4
        score += token_overlap(column, candidate)
        if score <= 0:
            continue
        candidates.append(
            {
                "name": candidate,
                "family": row["feature_family"],
                "missing_pct": safe_float(row.get("missing_percentage")),
                "priority_flag": bool(row.get("priority_flag")),
                "description": row.get("description"),
                "score": score,
            }
        )

    candidates.sort(
        key=lambda item: (
            item["score"],
            int(item["priority_flag"]),
            -(item["missing_pct"] or 0),
        ),
        reverse=True,
    )
    return candidates[:limit]


def build_feature_family_detail(family_name: str) -> dict:
    return to_serializable(repository.get_feature_family(family_name))


def build_columns_list(
    *,
    query: str = "",
    family: str | None = None,
    dtype: str | None = None,
    missing_threshold: float | None = None,
    priority_only: bool = False,
    limit: int | None = None,
) -> list[dict]:
    catalog = repository.columns_catalog.copy()

    if query:
        search = query.lower().strip()
        catalog = catalog[
            catalog["column"].str.lower().str.contains(search)
            | catalog["description"].str.lower().str.contains(search)
        ]
    if family:
        catalog = catalog[catalog["feature_family"] == family]
    if dtype:
        catalog = catalog[catalog["dtype_group"] == dtype]
    if missing_threshold is not None:
        catalog = catalog[catalog["missing_percentage"] >= missing_threshold]
    if priority_only:
        catalog = catalog[catalog["priority_flag"]]

    records = (
        catalog.sort_values(
            ["priority_flag", "missing_percentage", "column"], ascending=[False, False, True]
        )[
            [
                "column",
                "dtype",
                "dtype_group",
                "feature_family",
                "missing_percentage",
                "priority_flag",
                "description",
            ]
        ]
        .to_dict("records")
    )
    if limit:
        records = records[:limit]
    return to_serializable(records)


def build_overview() -> dict:
    payload = repository.overview_summary.copy()
    payload["columns"] = build_columns_list()
    return to_serializable(payload)


@lru_cache(maxsize=256)
def build_column_report(column: str) -> dict:
    repository.ensure_column_exists(column)
    catalog_row = repository.get_catalog_row(column)
    series_frame = repository.read_dataset("train", [column])
    series = series_frame[column]
    structural_stats = _structural_stats(series)
    dtype_group = classify_dtype(catalog_row["dtype"])
    distribution = (
        _numeric_distribution(series) if dtype_group == "numeric" else _categorical_distribution(series)
    )
    flags = _audit_flags(catalog_row, structural_stats, distribution)
    related = build_related_columns(column, limit=10)
    family = catalog_row["feature_family"]
    family_rows = repository.columns_catalog[repository.columns_catalog["feature_family"] == family]

    recommendations = {
        "missing_handling": catalog_row.get("recommendation")
        or "Review missingness in context of the feature family before applying a default rule.",
        "transformation": _transformation_recommendation(catalog_row, distribution),
        "encoding": catalog_row.get("encoding_recommendation")
        or "Use one-hot for dense low-cardinality categories and target/frequency encoding for wider categorical spaces.",
        "feature_engineering": _feature_engineering_note(catalog_row),
        "decision": _decision_recommendation(catalog_row, structural_stats, distribution),
    }

    family_context = {
        "name": family,
        "description": FEATURE_FAMILY_DESCRIPTIONS.get(family),
        "feature_count": int(family_rows["column"].nunique()),
        "average_missingness": safe_float(family_rows["missing_percentage"].mean()),
        "priority_columns": family_rows[family_rows["priority_flag"]]["column"].head(8).tolist(),
    }

    raw_report = {
        key: value
        for key, value in {**catalog_row}.items()
        if key not in {"description"}
    }

    response = {
        "identity": {
            "column_name": column,
            "dtype": catalog_row["dtype"],
            "dtype_group": dtype_group,
            "feature_family": family,
            "short_description": catalog_row["description"],
            "priority_flag": bool(catalog_row["priority_flag"]),
        },
        "structural_stats": structural_stats,
        "distribution_summary": distribution,
        "audit_flags": flags,
        "recommendations": recommendations,
        "family_context": family_context,
        "related_columns": related,
        "raw_report": raw_report,
        "quick_actions": {
            "suggested_visuals": (
                ["histogram", "kde", "boxplot", "target_overlay_histogram"]
                if dtype_group == "numeric"
                else ["countplot", "target_rate", "stacked_categorical_chart"]
            )
        },
    }
    return to_serializable(response)
