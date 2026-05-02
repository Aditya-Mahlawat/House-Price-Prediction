from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '../src'))
from features import add_features

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("../models/house_model.joblib")

class House(BaseModel):
    sqft_living: float
    sqft_lot: float
    bedrooms: int
    bathrooms: float
    floors: float
    waterfront: int
    view: int
    condition: int
    grade: int
    yr_built: int
    yr_renovated: int
    zipcode: str

@app.post("/predict")
def predict(h: House):
    df = pd.DataFrame([h.model_dump()])
    df = add_features(df)
    CAT = ["waterfront","zipcode"]
    df[CAT] = df[CAT].astype("object")
    
    price = float(model.predict(df)[0])
    return {
        "estimated_price": price,
        "price_formatted": f"${price:,.2f}"
    }
