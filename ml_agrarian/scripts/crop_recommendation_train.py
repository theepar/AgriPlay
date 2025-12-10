import pandas as pd
import numpy as np
from sklearn.preprocessing import  OneHotEncoder, LabelEncoder, OrdinalEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib

df = pd.read_csv("../data/crop_recommendation_model_ready_data.csv")
X = df.iloc[:,:-1].values
y = df.iloc[:, -1]

ct = ColumnTransformer(transformers=[
                                     ("ordinalencoding", OrdinalEncoder(), [-1])], remainder="passthrough")
X = ct.fit_transform(X)

le = LabelEncoder()
y = le.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0)

scaler = StandardScaler()
X[3:8] = scaler.fit_transform(X[3:8])

classifier = RandomForestClassifier(n_estimators = 10, criterion = 'entropy', random_state = 0)
classifier.fit(X, y)

joblib.dump(classifier, "../saved_models/crop_recommendation_classifier.joblib")
joblib.dump(ct, "../saved_models/crop_recommendation_transformer.joblib")
joblib.dump(le, "../saved_models/crop_recommendation_labelencoder.joblib")