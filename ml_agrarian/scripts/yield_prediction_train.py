import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
import joblib


df = pd.read_csv("../data/yield_prediction_model_ready_data.csv")
X = df.iloc[:, :-1].values
y = df.iloc[:, -1].values

ct = ColumnTransformer([("encoder", OneHotEncoder(), [0])], remainder="passthrough")
X = ct.fit_transform(X)
X = np.array(X)

# X_train ,X_test, y_train, y_test = train_test_split(X, y, train_size=0.25, random_state=0)

regressor = RandomForestRegressor(n_estimators=10, random_state=0)
# regressor.fit(X_train, y_train)
regressor.fit(X, y)

# y_pred = regressor.predict(X_test)

# print(np.concatenate([y_pred.reshape(-1,1), y_test.reshape(-1,1)], 1))

# joblib.dump(regressor, "../saved_models/yield_prediction_regressor.joblib")
# joblib.dump(ct, "../saved_models/yield_prediction_transformer.joblib")