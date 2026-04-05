from __future__ import annotations

import csv
import json
from functools import cached_property
from pathlib import Path
from typing import Iterable

import pandas as pd

from .config import settings
from .domain import (
    FEATURE_FAMILY_DESCRIPTIONS,
    classify_dtype,
    classify_feature_family,
    humanize_column_name,
    priority_flag,
)


class DataRepository:
    def __init__(self) -> None:
        self.settings = settings

    @cached_property
    def report_df(self) -> pd.DataFrame:
        frame = pd.read_csv(self.settings.master_report_path)
        frame["column"] = frame["column"].astype(str)
        return frame

    @cached_property
    def missingness_df(self) -> pd.DataFrame:
        frame = pd.read_csv(self.settings.missingness_report_path)
        frame["column"] = frame["column"].astype(str)
        return frame

    @cached_property
    def target_aware_df(self) -> pd.DataFrame:
        frame = pd.read_csv(self.settings.target_aware_report_path)
        frame["column"] = frame["column"].astype(str)
        return frame

    @cached_property
    def feature_importance_df(self) -> pd.DataFrame:
        frame = pd.read_csv(self.settings.feature_importance_path)
        return frame.sort_values("importance", ascending=False).reset_index(drop=True)

    @cached_property
    def model_summary(self) -> dict:
        with self.settings.model_summary_path.open(encoding="utf-8") as handle:
            return json.load(handle)

    @cached_property
    def description_map(self) -> dict[str, str]:
        descriptions: dict[str, str] = {}
        with self.settings.descriptions_path.open(encoding="latin-1", newline="") as handle:
            reader = csv.DictReader(handle)
            for row in reader:
                key = str(row.get("Row", "")).strip()
                description = str(row.get("Description", "")).strip()
                if key and description:
                    descriptions[key] = description
        return descriptions

    @cached_property
    def columns_catalog(self) -> pd.DataFrame:
        catalog = self.report_df.copy()
        missing_cols = [
            "column",
            "missing_count",
            "missing_percentage",
            "missing_group",
            "imputation_strategy",
            "recommendation",
            "effect_size",
            "p_value",
        ]
        catalog = catalog.merge(
            self.missingness_df[missing_cols],
            on="column",
            how="left",
            suffixes=("", "_missing"),
        )
        catalog["feature_family"] = catalog["column"].map(classify_feature_family)
        catalog["dtype_group"] = catalog["dtype"].map(classify_dtype)
        catalog["priority_flag"] = catalog["column"].map(priority_flag)
        catalog["description"] = catalog["column"].map(self.description_map).fillna(
            catalog["column"].map(humanize_column_name)
        )
        catalog["missing_percentage"] = pd.to_numeric(
            catalog["missing_percentage"], errors="coerce"
        ).fillna(pd.to_numeric(catalog.get("missing_pct"), errors="coerce"))
        return catalog

    @cached_property
    def feature_family_summary(self) -> list[dict]:
        grouped = (
            self.columns_catalog.groupby("feature_family", dropna=False)
            .agg(
                feature_count=("column", "count"),
                average_missingness=("missing_percentage", "mean"),
                numeric_count=("dtype_group", lambda values: (values == "numeric").sum()),
                categorical_count=(
                    "dtype_group",
                    lambda values: (values == "categorical").sum(),
                ),
                priority_count=("priority_flag", "sum"),
            )
            .reset_index()
        )
        rows = []
        for record in grouped.to_dict("records"):
            family = record["feature_family"]
            top_columns = (
                self.columns_catalog[self.columns_catalog["feature_family"] == family]
                .sort_values(["priority_flag", "missing_percentage"], ascending=[False, False])
                .head(6)["column"]
                .tolist()
            )
            rows.append(
                {
                    **record,
                    "description": FEATURE_FAMILY_DESCRIPTIONS.get(
                        family, "Grouped features with similar structural behavior."
                    ),
                    "examples": top_columns,
                }
            )
        return rows

    @cached_property
    def overview_summary(self) -> dict:
        catalog = self.columns_catalog
        return {
            "train_rows": 307511,
            "test_rows": 48744,
            "total_columns": int(catalog["column"].nunique()),
            "numeric_columns": int((catalog["dtype_group"] == "numeric").sum()),
            "categorical_columns": int((catalog["dtype_group"] == "categorical").sum()),
            "target_available": True,
            "missing_heavy_columns": int((catalog["missing_percentage"] >= 50).sum()),
            "feature_type_distribution": [
                {
                    "name": "Numeric",
                    "value": int((catalog["dtype_group"] == "numeric").sum()),
                },
                {
                    "name": "Categorical",
                    "value": int((catalog["dtype_group"] == "categorical").sum()),
                },
            ],
            "family_distribution": self.feature_family_summary,
            "source_files": [
                {
                    "name": "final_train_before_eda.csv",
                    "role": "Consolidated training dataset with target and 584 columns.",
                },
                {
                    "name": "final_test_before_eda.csv",
                    "role": "Consolidated test dataset aligned to the audit explorer.",
                },
                {
                    "name": "9.master_consolidated_report.csv",
                    "role": "Primary structural audit source for explorer summaries and raw report rows.",
                },
                {
                    "name": "missingness_report.csv",
                    "role": "Missingness recommendations and effect-size signals.",
                },
            ],
            "top_structural_insights": [
                "Structural audit was used as the backbone because the consolidated dataset spans 584 columns and multiple historical families.",
                "Historical aggregated features carry a very different missingness meaning from direct application fields, so global imputation would have been weak.",
                "Selective EDA was a strategic choice to reduce noise and focus on columns with the strongest structural or target-linked evidence.",
            ],
            "preview_rows": self.load_preview_rows("train", limit=8),
        }

    def ensure_column_exists(self, column: str) -> None:
        if column not in set(self.columns_catalog["column"]):
            raise KeyError(f"Unknown column: {column}")

    def get_catalog_row(self, column: str) -> dict:
        self.ensure_column_exists(column)
        row = self.columns_catalog[self.columns_catalog["column"] == column].iloc[0]
        return row.to_dict()

    def get_feature_family(self, family_name: str) -> dict:
        matches = [row for row in self.feature_family_summary if row["feature_family"] == family_name]
        if not matches:
            raise KeyError(f"Unknown feature family: {family_name}")
        family = matches[0]
        columns = (
            self.columns_catalog[self.columns_catalog["feature_family"] == family_name]
            .sort_values(["priority_flag", "missing_percentage"], ascending=[False, False])
            [["column", "dtype", "dtype_group", "missing_percentage", "priority_flag", "description"]]
            .head(40)
            .to_dict("records")
        )
        return {**family, "columns": columns}

    def load_preview_rows(self, dataset: str, limit: int = 8) -> list[dict]:
        preview_columns = [
            "SK_ID_CURR",
            "TARGET",
            "AMT_INCOME_TOTAL",
            "AMT_CREDIT",
            "AMT_ANNUITY",
            "NAME_INCOME_TYPE",
            "NAME_EDUCATION_TYPE",
            "EXT_SOURCE_3",
        ]
        available = [column for column in preview_columns if column in self.available_columns(dataset)]
        frame = self.read_dataset(dataset, available, nrows=limit)
        return frame.fillna("").astype(str).to_dict("records")

    def available_columns(self, dataset: str) -> set[str]:
        if dataset == "train":
            return set(self.columns_catalog["column"])
        if dataset == "test":
            return set(self.columns_catalog["column"]) - {"TARGET"}
        return set(self.columns_catalog["column"]) | {"dataset_source"}

    def dataset_path(self, dataset: str) -> Path:
        if dataset == "train":
            return self.settings.train_data_path
        if dataset == "test":
            return self.settings.test_data_path
        raise ValueError(f"Unsupported dataset: {dataset}")

    def read_dataset(
        self,
        dataset: str,
        columns: Iterable[str],
        *,
        nrows: int | None = None,
    ) -> pd.DataFrame:
        requested = [column for column in columns if column]
        if dataset == "combined":
            base_columns = [column for column in requested if column != "dataset_source"]
            train = self.read_dataset("train", base_columns, nrows=nrows)
            test = self.read_dataset("test", base_columns, nrows=nrows)
            if "TARGET" in base_columns and "TARGET" not in test.columns:
                test["TARGET"] = pd.NA
            train["dataset_source"] = "train"
            test["dataset_source"] = "test"
            all_columns = list(dict.fromkeys(base_columns + ["dataset_source"]))
            return pd.concat(
                [train.reindex(columns=all_columns), test.reindex(columns=all_columns)],
                ignore_index=True,
            )

        available = self.available_columns(dataset)
        safe_columns = [column for column in requested if column in available]
        return pd.read_csv(
            self.dataset_path(dataset),
            usecols=safe_columns,
            nrows=nrows,
            low_memory=False,
        )


repository = DataRepository()
