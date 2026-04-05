from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd

from .domain import classify_dtype, safe_float, top_n_categories, to_serializable
from .repository import repository


def _sample_frame(frame: pd.DataFrame, sample_size: int) -> pd.DataFrame:
    if sample_size and len(frame) > sample_size:
        return frame.sample(sample_size, random_state=42)
    return frame


def _apply_missing_strategy(
    frame: pd.DataFrame, columns: list[str], missing_strategy: str
) -> tuple[pd.DataFrame, str]:
    working = frame.copy()
    if missing_strategy == "keep":
        for column in columns:
            if classify_dtype(str(working[column].dtype)) == "categorical":
                working[column] = working[column].fillna("Missing")
        return (
            working,
            "Missing categorical values retained as explicit categories. Numeric nulls are still dropped when plotting requires clean values.",
        )

    return working.dropna(subset=columns), "Rows with missing values in the selected plot columns were dropped."


def _clip_numeric(
    frame: pd.DataFrame, columns: list[str], quantile_clip: float | None
) -> tuple[pd.DataFrame, str | None]:
    if not quantile_clip or quantile_clip <= 0:
        return frame, None

    clipped = frame.copy()
    for column in columns:
        if classify_dtype(str(clipped[column].dtype)) != "numeric":
            continue
        lower = clipped[column].quantile(quantile_clip)
        upper = clipped[column].quantile(1 - quantile_clip)
        clipped[column] = clipped[column].clip(lower, upper)
    return clipped, f"Numeric values clipped at the {quantile_clip:.0%} and {1-quantile_clip:.0%} quantiles."


def _apply_log_scale(
    frame: pd.DataFrame, columns: list[str], log_scale: bool
) -> tuple[pd.DataFrame, str | None]:
    if not log_scale:
        return frame, None

    transformed = frame.copy()
    notes = []
    for column in columns:
        if classify_dtype(str(transformed[column].dtype)) != "numeric":
            continue
        positive_mask = transformed[column] > 0
        transformed = transformed[positive_mask]
        transformed[column] = np.log1p(transformed[column])
        notes.append(column)
    if not notes:
        return frame, None
    return transformed, f"Log scale applied with log1p on positive values for {', '.join(notes)}."


def _manual_kde(values: np.ndarray, points: int = 80) -> list[dict]:
    if values.size == 0:
        return []
    grid = np.linspace(values.min(), values.max(), points)
    std = values.std() if values.size > 1 else 1
    bandwidth = 1.06 * std * (values.size ** (-1 / 5)) if std > 0 else 1.0
    bandwidth = max(float(bandwidth), 1e-3)
    densities = []
    for point in grid:
        kernel = np.exp(-0.5 * ((point - values) / bandwidth) ** 2)
        density = float(kernel.sum() / (len(values) * bandwidth * np.sqrt(2 * np.pi)))
        densities.append({"x": float(point), "density": density})
    return densities


def _stats_payload(frame: pd.DataFrame, columns: list[str]) -> list[dict]:
    payload = [{"label": "Rows used", "value": f"{len(frame):,}"}]
    for column in columns:
        if classify_dtype(str(frame[column].dtype)) == "numeric":
            payload.append(
                {
                    "label": f"{column} mean",
                    "value": f"{float(pd.to_numeric(frame[column], errors='coerce').mean()):,.4f}",
                }
            )
        else:
            top = frame[column].fillna("Missing").astype(str).value_counts().head(1)
            if not top.empty:
                payload.append(
                    {
                        "label": f"{column} top value",
                        "value": f"{top.index[0]} ({top.iloc[0]})",
                    }
                )
    return payload


def _plot_metadata(
    dataset: str,
    sample_size: int,
    missing_note: str,
    clipping_note: str | None,
    log_note: str | None,
) -> dict:
    return {
        "dataset": dataset,
        "sample_size": sample_size,
        "missing_handling": missing_note,
        "clipping": clipping_note or "No quantile clipping applied.",
        "log_scale": log_note or "Log scale disabled.",
    }


def _recommendations(primary_column: str, secondary_column: str | None = None) -> list[str]:
    recommendations = []
    if "AMT_ANNUITY" in primary_column:
        recommendations.append("Compare this with AMT_CREDIT or APP_CREDIT_ANNUITY_RATIO to judge repayment burden.")
    if "EXT_SOURCE" in primary_column:
        recommendations.append("External source features are high-priority. Try a target overlay or compare against other EXT_SOURCE columns.")
    if "OCCUPATION" in primary_column or "NAME_" in primary_column:
        recommendations.append("Switch to target-rate or stacked-category views to see whether category differences are real or just frequency noise.")
    if secondary_column:
        recommendations.append("Mixed-type plots work best after trimming to the top categories so the visual stays readable.")
    if not recommendations:
        recommendations.append("Use the metadata panel to see whether clipping, sampling, or missing-value handling changed the shape of the plot.")
    return recommendations


def build_univariate_plot(payload: dict[str, Any]) -> dict:
    dataset = payload.get("dataset", "train")
    column = payload["column"]
    plot_type = payload["plot_type"]
    sample_size = int(payload.get("sample_size", 20000))
    quantile_clip = payload.get("quantile_clip")
    log_scale = bool(payload.get("log_scale", False))
    missing_strategy = payload.get("missing_strategy", "drop")
    top_n = int(payload.get("top_n", 12))
    target_overlay = bool(payload.get("target_overlay", False))

    frame = repository.read_dataset(
        dataset,
        [column, "TARGET"] if target_overlay and dataset == "train" else [column],
    )
    frame, missing_note = _apply_missing_strategy(
        frame,
        [column] + (["TARGET"] if "TARGET" in frame.columns else []),
        missing_strategy,
    )
    frame = _sample_frame(frame, sample_size)
    frame, clipping_note = _clip_numeric(frame, [column], quantile_clip)
    frame, log_note = _apply_log_scale(frame, [column], log_scale)

    dtype_group = classify_dtype(str(frame[column].dtype))

    if dtype_group == "numeric":
        clean = pd.to_numeric(frame[column], errors="coerce").dropna()
        if plot_type in {"histogram", "target_overlay_histogram"}:
            bins = np.histogram_bin_edges(clean, bins=24)
            if target_overlay and "TARGET" in frame.columns:
                working = frame.dropna(subset=[column, "TARGET"]).copy()
                working["_bin"] = pd.cut(working[column], bins=bins, include_lowest=True)
                grouped = (
                    working.groupby(["_bin", "TARGET"], observed=True)
                    .size()
                    .unstack(fill_value=0)
                    .reset_index()
                )
                chart_data = []
                for _, row in grouped.iterrows():
                    chart_data.append(
                        {
                            "label": str(row["_bin"]),
                            "non_default": int(row.get(0, 0)),
                            "default": int(row.get(1, 0)),
                        }
                    )
                kind = "stacked-histogram"
            else:
                counts, edges = np.histogram(clean, bins=bins)
                chart_data = [
                    {
                        "label": f"{edges[index]:.2f} to {edges[index + 1]:.2f}",
                        "count": int(counts[index]),
                    }
                    for index in range(len(counts))
                ]
                kind = "histogram"
        elif plot_type in {"kde", "violinplot"}:
            chart_data = _manual_kde(clean.to_numpy())
            kind = "violin" if plot_type == "violinplot" else "density-line"
        else:
            summary = clean.describe(percentiles=[0.25, 0.5, 0.75])
            chart_data = {
                "min": safe_float(summary["min"]),
                "q1": safe_float(summary["25%"]),
                "median": safe_float(summary["50%"]),
                "q3": safe_float(summary["75%"]),
                "max": safe_float(summary["max"]),
                "mean": safe_float(summary["mean"]),
            }
            kind = "box-summary"
    else:
        if plot_type == "target_rate" and dataset == "train":
            working = frame[[column, "TARGET"]].copy()
            working[column] = working[column].fillna("Missing").astype(str)
            top_categories = working[column].value_counts().head(top_n).index.tolist()
            working[column] = working[column].where(working[column].isin(top_categories), "Other")
            grouped = (
                working.groupby(column, observed=True)
                .agg(count=("TARGET", "size"), target_rate=("TARGET", "mean"))
                .reset_index()
                .sort_values("target_rate", ascending=False)
            )
            chart_data = grouped.rename(columns={column: "category"}).to_dict("records")
            kind = "target-rate-bar"
        else:
            chart_data = top_n_categories(frame[column], limit=top_n).to_dict("records")
            kind = "bar"

    return to_serializable(
        {
            "kind": kind,
            "title": f"{plot_type.replace('_', ' ').title()} for {column}",
            "chart_data": chart_data,
            "stats": _stats_payload(frame, [column]),
            "metadata": _plot_metadata(dataset, sample_size, missing_note, clipping_note, log_note),
            "recommendations": _recommendations(column),
        }
    )


def build_bivariate_plot(payload: dict[str, Any]) -> dict:
    dataset = payload.get("dataset", "train")
    x_column = payload["x_column"]
    y_column = payload["y_column"]
    plot_type = payload["plot_type"]
    sample_size = int(payload.get("sample_size", 12000))
    quantile_clip = payload.get("quantile_clip")
    log_scale = bool(payload.get("log_scale", False))
    missing_strategy = payload.get("missing_strategy", "drop")
    top_n = int(payload.get("top_n", 10))

    required_columns = [x_column, y_column]
    frame = repository.read_dataset(dataset, required_columns)
    frame, missing_note = _apply_missing_strategy(frame, required_columns, missing_strategy)
    frame = _sample_frame(frame, sample_size)
    frame, clipping_note = _clip_numeric(frame, [x_column, y_column], quantile_clip)
    frame, log_note = _apply_log_scale(frame, [x_column, y_column], log_scale)

    x_dtype = classify_dtype(str(frame[x_column].dtype))
    y_dtype = classify_dtype(str(frame[y_column].dtype))

    if x_dtype == "numeric" and y_dtype == "numeric":
        clean = frame.dropna(subset=[x_column, y_column]).copy()
        points = clean[[x_column, y_column]].rename(columns={x_column: "x", y_column: "y"}).to_dict("records")
        response = {
            "kind": "scatter",
            "title": f"{x_column} vs {y_column}",
            "chart_data": {"points": points},
        }
        if plot_type == "regression":
            coefficients = np.polyfit(clean[x_column], clean[y_column], 1)
            grid = np.linspace(clean[x_column].min(), clean[x_column].max(), 50)
            response["chart_data"]["regression"] = [
                {"x": float(point), "y": float(coefficients[0] * point + coefficients[1])}
                for point in grid
            ]
    elif x_dtype == "categorical" and y_dtype == "categorical":
        working = frame[[x_column, y_column]].fillna("Missing").astype(str)
        top_x = working[x_column].value_counts().head(top_n).index.tolist()
        top_y = working[y_column].value_counts().head(min(6, top_n)).index.tolist()
        working[x_column] = working[x_column].where(working[x_column].isin(top_x), "Other")
        working[y_column] = working[y_column].where(working[y_column].isin(top_y), "Other")
        grouped = working.groupby([x_column, y_column], observed=True).size().reset_index(name="count")
        pivot = grouped.pivot(index=x_column, columns=y_column, values="count").fillna(0)
        response = {
            "kind": "stacked-bar",
            "title": f"{x_column} by {y_column}",
            "chart_data": {
                "rows": pivot.reset_index().rename(columns={x_column: "category"}).to_dict("records"),
                "series_keys": [str(col) for col in pivot.columns],
            },
        }
    else:
        numeric_col = x_column if x_dtype == "numeric" else y_column
        categorical_col = y_column if x_dtype == "numeric" else x_column
        working = frame[[numeric_col, categorical_col]].dropna().copy()
        working[categorical_col] = working[categorical_col].astype(str)
        top_categories = working[categorical_col].value_counts().head(top_n).index.tolist()
        working[categorical_col] = working[categorical_col].where(
            working[categorical_col].isin(top_categories), "Other"
        )
        grouped = (
            working.groupby(categorical_col, observed=True)[numeric_col]
            .agg(["count", "min", "median", "mean", "max"])
            .reset_index()
            .rename(columns={categorical_col: "category"})
        )
        response = {
            "kind": "grouped-summary" if plot_type not in {"boxplot", "violinplot"} else "box-summary-group",
            "title": f"{numeric_col} across {categorical_col}",
            "chart_data": grouped.to_dict("records"),
        }

    response.update(
        {
            "stats": _stats_payload(frame, [x_column, y_column]),
            "metadata": _plot_metadata(dataset, sample_size, missing_note, clipping_note, log_note),
            "recommendations": _recommendations(x_column, y_column),
        }
    )
    return to_serializable(response)
