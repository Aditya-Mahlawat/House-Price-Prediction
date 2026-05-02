import pandas as pd
import numpy as np
import os

def generate_synthetic_data(n=8000):
    np.random.seed(42)
    
    sqft_living = np.random.uniform(800, 5000, size=n)
    sqft_lot = np.random.uniform(1000, 20000, size=n)
    bedrooms = np.random.randint(1, 6, size=n)
    bathrooms = np.random.uniform(1, 4.5, size=n)
    floors = np.random.choice([1.0, 1.5, 2.0, 2.5, 3.0], size=n)
    
    waterfront = np.random.choice([0, 1], size=n, p=[0.95, 0.05])
    view = np.random.randint(0, 5, size=n)
    condition = np.random.randint(1, 6, size=n)
    grade = np.random.randint(4, 13, size=n)
    
    yr_built = np.random.randint(1900, 2024, size=n)
    yr_renovated = np.where(np.random.rand(n) < 0.2, np.random.randint(yr_built, 2024, size=n), 0)
    
    zipcode = np.random.choice([f"98{np.random.randint(100):03d}" for _ in range(50)], size=n)
    
    # Base price calculation
    price = 100000 + 150 * sqft_living + 10 * sqft_lot
    price += 10000 * bedrooms + 15000 * bathrooms + 20000 * floors
    price += 200000 * waterfront + 30000 * view
    price += 20000 * condition + 50000 * (grade - 7)
    price += 1000 * (yr_built - 1900)
    
    price *= np.random.lognormal(mean=0, sigma=0.1, size=n)
    
    df = pd.DataFrame({
        "house_id": [f"H_{i:05d}" for i in range(n)],
        "date": pd.date_range(start="2023-01-01", periods=n).strftime("%Y-%m-%d"),
        "price": price,
        "sqft_living": sqft_living,
        "sqft_lot": sqft_lot,
        "bedrooms": bedrooms,
        "bathrooms": bathrooms,
        "floors": floors,
        "waterfront": waterfront,
        "view": view,
        "condition": condition,
        "grade": grade,
        "yr_built": yr_built,
        "yr_renovated": yr_renovated,
        "zipcode": zipcode
    })
    
    SCHEMA = {
        "house_id":"string", "date":"string", "price":"float64",
        "sqft_living":"float64", "sqft_lot":"float64", "bedrooms":"int64",
        "bathrooms":"float64", "floors":"float64", "waterfront":"int64",
        "view":"int64", "condition":"int64", "grade":"int64",
        "yr_built":"int64", "yr_renovated":"int64", "zipcode":"string"
    }
    df = df.astype(SCHEMA)
    
    os.makedirs("../data", exist_ok=True)
    df.to_parquet("../data/houses.parquet")
    print("Generated synthetic data.")
    print("Shape:", df.shape)

if __name__ == "__main__":
    generate_synthetic_data()
