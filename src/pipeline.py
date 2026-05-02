from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline

NUM = ["sqft_living","sqft_lot","bedrooms","bathrooms","floors","view","condition",
       "grade","yr_built","yr_renovated","age","years_since_renovation",
       "total_rooms","sqft_ratio","log_sqft_living","log_sqft_lot"]
CAT = ["waterfront","zipcode"]

num = Pipeline([("imp", SimpleImputer(strategy="median")),("sc", StandardScaler())])
cat = Pipeline([("imp", SimpleImputer(strategy="most_frequent")),
                ("ohe", OneHotEncoder(handle_unknown="ignore"))])

pre = ColumnTransformer([("num", num, NUM), ("cat", cat, CAT)])
