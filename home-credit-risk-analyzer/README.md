# Home Credit Audit & Visualization Studio

Artifact-backed React frontend for the Home Credit Default Risk audit-first case study.

## What This App Does

- Turns saved notebook outputs into a multi-page audit and visualization product
- Explains the structural audit, selective EDA, feature engineering, and model-performance story
- Connects to the FastAPI backend for dataset overview, column audit, and chart-ready visualization payloads

## Artifact Sources

- `../Report/9.master_consolidated_report.csv`
- `../Report/2.missingness_report.csv`
- `../Report/8.numerical_target_aware.csv`
- `../model_outputs_fast_gpu/training_summary.json`
- `../model_outputs_fast_gpu/feature_importance_catboost.csv`
- `../model_outputs_fast_gpu/oof_predictions.csv`

## Scripts

- `npm.cmd run dev`
- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd run preview`

## Backend

- During local development, Vite proxies `/api/*` to `http://127.0.0.1:8000`
- Run the FastAPI backend from the repo root as described in the root `README.md`

## Notes

- This pass does not add automatic artifact syncing or production model serving.
- Fallback demo payloads are still present so the UI remains usable if the backend is temporarily unavailable.
