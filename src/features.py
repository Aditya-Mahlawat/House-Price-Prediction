import pandas as pd
import numpy as np

def add_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["age"] = 2024 - df["yr_built"]
    df["years_since_renovation"] = np.where(df["yr_renovated"] > 0, 2024 - df["yr_renovated"], df["age"])
    df["total_rooms"] = df["bedrooms"] + df["bathrooms"]
    df["sqft_ratio"] = df["sqft_living"] / (df["sqft_lot"] + 1)
    df["log_sqft_living"] = np.log1p(df["sqft_living"])
    df["log_sqft_lot"] = np.log1p(df["sqft_lot"])
    return df
