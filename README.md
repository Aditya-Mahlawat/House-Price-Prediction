# House Price Prediction using Regression Models

> **Property valuation estimator** powered by XGBoost regression with engineered housing features.

## Project Structure
```
House-Price-Prediction/
├── data/
│   └── houses.parquet        # 8,000 synthetic property records
├── notebooks/
│   └── 01_ingest.py          # Synthetic data generation
├── src/
│   ├── features.py           # Feature engineering (age, sqft_ratio, log transforms)
│   ├── pipeline.py           # Preprocessing pipeline
│   └── tune_optuna.py        # Optuna HPO + XGBoost regressor
├── models/
│   └── house_model.joblib
├── serving/
│   └── app.py                # POST /predict → estimated_price, price_formatted
├── apps/web/                 # Next.js Property Value Estimator UI (with form)
└── venv/
```

## Quick Start

### 1. Generate Data & Train
```powershell
cd notebooks
..\venv\Scripts\python.exe 01_ingest.py

cd ..\src
..\venv\Scripts\python.exe tune_optuna.py
```

### 2. Run Backend
```powershell
cd serving
..\venv\Scripts\python.exe -m uvicorn app:app --port 8000 --reload
```

### 3. Run Frontend
```powershell
cd apps\web
C:\Program Files\nodejs\npm.cmd run dev
```

## API Reference

### POST /predict
```json
{
  "sqft_living": 2500, "sqft_lot": 5000,
  "bedrooms": 4, "bathrooms": 2.5, "floors": 2.0,
  "waterfront": 0, "view": 2, "condition": 4, "grade": 8,
  "yr_built": 1995, "yr_renovated": 0, "zipcode": "98001"
}
```
**Response:**
```json
{
  "estimated_price": 948186.0,
  "price_formatted": "$948,186.00"
}
```

## Tech Stack
- **ML**: XGBoost Regressor + Optuna HPO (RMSE metric)
- **Backend**: FastAPI + Uvicorn
- **Frontend**: Next.js 16 interactive form with live estimation
- **Data**: Synthetic (8,000 houses, engineered pricing model)
