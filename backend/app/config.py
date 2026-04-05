from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    root_dir: Path = Path(__file__).resolve().parents[2]
    app_name: str = "Home Credit Audit & Visualization Studio API"
    frontend_origin: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

    @property
    def train_data_path(self) -> Path:
        return self.root_dir / "Data" / "Processed" / "final_train_before_eda.csv"

    @property
    def test_data_path(self) -> Path:
        return self.root_dir / "Data" / "Processed" / "final_test_before_eda.csv"

    @property
    def master_report_path(self) -> Path:
        return self.root_dir / "Report" / "9.master_consolidated_report.csv"

    @property
    def missingness_report_path(self) -> Path:
        return self.root_dir / "Report" / "missingness_report.csv"

    @property
    def target_aware_report_path(self) -> Path:
        return self.root_dir / "Report" / "8.numerical_target_aware.csv"

    @property
    def model_summary_path(self) -> Path:
        return self.root_dir / "model_outputs_fast_gpu" / "training_summary.json"

    @property
    def feature_importance_path(self) -> Path:
        return self.root_dir / "model_outputs_fast_gpu" / "feature_importance_catboost.csv"

    @property
    def oof_predictions_path(self) -> Path:
        return self.root_dir / "model_outputs_fast_gpu" / "oof_predictions.csv"

    @property
    def descriptions_path(self) -> Path:
        return self.root_dir / "Data" / "Raw" / "HomeCredit_columns_description.csv"

    @property
    def raw_application_train_path(self) -> Path:
        return self.root_dir / "Data" / "Raw" / "application_train.csv"

    @property
    def raw_application_test_path(self) -> Path:
        return self.root_dir / "Data" / "Raw" / "application_test.csv"


settings = Settings()
