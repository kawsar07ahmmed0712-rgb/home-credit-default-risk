from __future__ import annotations

import math
import re
from typing import Any

import numpy as np
import pandas as pd

FEATURE_FAMILY_DESCRIPTIONS = {
    "Application Features": "Core applicant, contract, time, demographic, and external-source fields from the consolidated application dataset.",
    "Ratio Features": "Columns that explicitly encode ratios, rates, or engineered relative burden features.",
    "Social / Inquiry Features": "Social-circle, bureau-request, delinquency, and behavioral pressure indicators.",
    "Housing Features": "Property, building, apartment, and location-related features with repeated AVG/MEDI/MODE structures.",
    "Historical Aggregated Features": "Aggregates derived from bureau, previous applications, installments, POS, and credit-card history tables.",
}

HISTORICAL_PREFIXES = ("BUREAU_", "PREV_", "APPROVED_", "REFUSED_", "POS_", "CC_", "INS_")

HOUSING_TOKENS = (
    "APARTMENTS",
    "BASEMENT",
    "COMMONAREA",
    "ELEVATORS",
    "EMERGENCYSTATE",
    "ENTRANCES",
    "FLOORSMAX",
    "FLOORSMIN",
    "FONDKAPREMONT",
    "HOUSETYPE",
    "LANDAREA",
    "LIVINGAPARTMENTS",
    "LIVINGAREA",
    "NONLIVINGAPARTMENTS",
    "NONLIVINGAREA",
    "TOTALAREA",
    "WALLSMATERIAL",
    "YEARS_BEGINEXPLUATATION",
    "YEARS_BUILD",
)

SOCIAL_TOKENS = ("SOCIAL_CIRCLE", "AMT_REQ_CREDIT_BUREAU", "OBS_", "DEF_")
RATIO_TOKENS = ("RATIO", "RATE", "PCT")

PRIORITY_COLUMNS = {
    "AMT_ANNUITY",
    "AMT_CREDIT",
    "AMT_GOODS_PRICE",
    "AMT_INCOME_TOTAL",
    "APP_CREDIT_ANNUITY_RATIO",
    "APP_EXT_SOURCE_MAX",
    "APP_EXT_SOURCE_MEAN",
    "APP_EXT_SOURCE_MIN",
    "CC_BALANCE_LIMIT_RATIO_MEAN",
    "CC_PAYMENT_MIN_RATIO_MEAN",
    "CNT_CHILDREN",
    "DAYS_BIRTH",
    "DAYS_EMPLOYED",
    "DAYS_LAST_PHONE_CHANGE",
    "EXT_SOURCE_1",
    "EXT_SOURCE_2",
    "EXT_SOURCE_3",
    "NAME_EDUCATION_TYPE",
    "NAME_FAMILY_STATUS",
    "NAME_HOUSING_TYPE",
    "NAME_INCOME_TYPE",
    "OCCUPATION_TYPE",
    "OBS_30_CNT_SOCIAL_CIRCLE",
    "TARGET",
}


def classify_feature_family(column: str) -> str:
    name = column.upper()
    if name.startswith(HISTORICAL_PREFIXES):
        return "Historical Aggregated Features"
    if any(token in name for token in HOUSING_TOKENS):
        return "Housing Features"
    if any(token in name for token in SOCIAL_TOKENS):
        return "Social / Inquiry Features"
    if any(token in name for token in RATIO_TOKENS) or name.startswith(("APP_", "FE_")):
        return "Ratio Features"
    return "Application Features"


def classify_dtype(dtype_name: str) -> str:
    normalized = str(dtype_name).lower()
    if "object" in normalized or "string" in normalized or "category" in normalized:
        return "categorical"
    if "bool" in normalized:
        return "boolean"
    return "numeric"


def priority_flag(column: str) -> bool:
    return column in PRIORITY_COLUMNS


def humanize_column_name(column: str) -> str:
    pieces = column.replace("__", "_").split("_")
    return " ".join(piece.title() for piece in pieces if piece)


def root_signature(column: str) -> str:
    cleaned = re.sub(r"(_MEAN|_MAX|_MIN|_SUM|_MEDIAN|_STD|_MODE|_AVG)$", "", column)
    cleaned = re.sub(r"_[0-9]+$", "", cleaned)
    return cleaned


def token_overlap(left: str, right: str) -> int:
    stopwords = {"CNT", "AMT", "DAYS", "NAME", "FLAG", "REGION", "APP", "FE"}
    left_tokens = {token for token in left.split("_") if token and token not in stopwords}
    right_tokens = {token for token in right.split("_") if token and token not in stopwords}
    return len(left_tokens & right_tokens)


def safe_float(value: Any) -> float | None:
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        return None
    if math.isnan(numeric) or math.isinf(numeric):
        return None
    return numeric


def to_serializable(value: Any) -> Any:
    if isinstance(value, dict):
        return {str(key): to_serializable(inner) for key, inner in value.items()}
    if isinstance(value, list):
        return [to_serializable(item) for item in value]
    if isinstance(value, tuple):
        return [to_serializable(item) for item in value]
    if isinstance(value, (np.generic,)):
        return value.item()
    if isinstance(value, pd.Timestamp):
        return value.isoformat()
    if pd.isna(value):
        return None
    return value


def top_n_categories(series: pd.Series, limit: int = 12) -> pd.DataFrame:
    values = series.fillna("Missing").astype(str)
    counts = values.value_counts(dropna=False).head(limit)
    total = max(len(values), 1)
    return pd.DataFrame(
        {
            "category": counts.index.astype(str),
            "count": counts.values,
            "share": counts.values / total,
        }
    )
