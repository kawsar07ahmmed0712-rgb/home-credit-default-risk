# Home Credit Audit & Visualization Studio

Portfolio-grade React + FastAPI application for the Home Credit Default Risk project.

## Architecture

The project is split into two app layers:

- `home-credit-risk-analyzer/`
  React + Vite frontend for the multi-page product experience.
- `backend/`
  FastAPI service that serves dataset overview, column audit, feature-family detail, and chart-ready plot payloads.

The frontend is structured around reusable page sections, chart cards, audit panels, and service hooks. The backend is structured around:

- `config.py` for dataset/report paths
- `repository.py` for loading reports and selected dataset columns
- `analytics.py` for overview and audit payloads
- `plotting.py` for univariate and bivariate visualization data
- `main.py` for API routing

## Data Sources

The current build is backed by existing project artifacts:

- `Report/9.master_consolidated_report.csv`
- `Report/2.missingness_report.csv`
- `Report/8.numerical_target_aware.csv`
- `Data/Processed/final_train_before_eda.csv`
- `Data/Processed/final_test_before_eda.csv`
- `Data/Raw/HomeCredit_columns_description.csv`
- `model_outputs_fast_gpu/training_summary.json`
- `model_outputs_fast_gpu/feature_importance_catboost.csv`
- `model_outputs_fast_gpu/oof_predictions.csv`

## File Structure

```text
home-credit-default-risk/
├─ backend/
│  ├─ app/
│  │  ├─ analytics.py
│  │  ├─ config.py
│  │  ├─ domain.py
│  │  ├─ main.py
│  │  ├─ plotting.py
│  │  └─ repository.py
│  └─ requirements.txt
├─ home-credit-risk-analyzer/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ data/
│  │  ├─ hooks/
│  │  ├─ pages/
│  │  ├─ services/
│  │  └─ utils/
│  └─ vite.config.js
├─ Data/
├─ Report/
└─ model_outputs_fast_gpu/
```

## Setup

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend

```powershell
cd home-credit-risk-analyzer
npm install
npm run dev
```

The Vite dev server proxies `/api/*` to `http://127.0.0.1:8000`.

## Main Pages

- Home
- Dataset Overview
- Column Audit Explorer
- Visualization Studio
- Feature Families
- EDA Highlights
- Feature Engineering Summary
- Model Performance
- Methodology
- About
- Future Prediction Studio

## API Endpoints

- `GET /api/health`
- `GET /api/overview`
- `GET /api/columns`
- `GET /api/column-report/{column_name}`
- `GET /api/related-columns/{column_name}`
- `GET /api/feature-families`
- `GET /api/feature-family/{family_name}`
- `POST /api/plot/univariate`
- `POST /api/plot/bivariate`

## Deployment Notes

- The frontend can be deployed as a static Vite build.
- The backend can be deployed as a FastAPI service.
- Prediction serving is intentionally deferred; version 1 is audit-first and visualization-first.
