import optuna
import pandas as pd
import numpy as np
import os
import joblib
from sklearn.pipeline import Pipeline
from sklearn.metrics import root_mean_squared_error
from xgboost import XGBRegressor
from features import add_features
from pipeline import pre

def main():
    df = pd.read_parquet("../data/houses.parquet")
    cut = int(len(df)*0.8)
    tr, va = df.iloc[:cut], df.iloc[cut:]
    tr, va = add_features(tr), add_features(va)
    
    Xtr = tr.drop(columns=["price","date","house_id"])
    ytr = tr["price"]
    Xva = va.drop(columns=["price","date","house_id"])
    yva = va["price"]
    
    CAT = ["waterfront","zipcode"]
    Xtr[CAT] = Xtr[CAT].astype("object")
    Xva[CAT] = Xva[CAT].astype("object")
    
    def objective(trial):
        params = dict(
            n_estimators=trial.suggest_int("n_estimators",100,300),
            max_depth=trial.suggest_int("max_depth",4,8),
            learning_rate=trial.suggest_float("lr",0.01,0.2,log=True),
            random_state=42, 
            n_jobs=-1
        )
        pipe = Pipeline([("pre", pre), ("xgb", XGBRegressor(**params))])
        pipe.fit(Xtr, ytr)
        p = pipe.predict(Xva)
        return root_mean_squared_error(yva, p)
        
    study = optuna.create_study(direction="minimize")
    study.optimize(objective, n_trials=3)
    
    best = study.best_params
    print(best)
    
    final = Pipeline([("pre", pre), ("xgb", XGBRegressor(**best, random_state=42, n_jobs=-1))]).fit(Xtr, ytr)
    
    os.makedirs("../models", exist_ok=True)
    joblib.dump(final, "../models/house_model.joblib")
    print("Model saved")

if __name__ == "__main__":
    main()
