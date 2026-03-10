import pandas as pd
import numpy as np
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, mean_squared_error, r2_score

os.makedirs("backend/models/saved", exist_ok=True)

print("Loading dataset...")
df = pd.read_csv("ml_pipeline/dataset/student_data.csv")

le_weak = LabelEncoder()
df["weak_subjects_enc"] = le_weak.fit_transform(df["weak_subjects"])

le_risk = LabelEncoder()
df["risk_level_enc"] = le_risk.fit_transform(df["risk_level"])

FEATURES = ["study_hours","sleep_hours","screen_time","prev_semester_score",
            "attendance","weekly_test_score","assignment_score","weak_subjects_enc"]

X = df[FEATURES]
y_class = df["risk_level_enc"]
y_reg = df["performance_score"]

X_train, X_test, yc_train, yc_test, yr_train, yr_test = train_test_split(
    X, y_class, y_reg, test_size=0.2, random_state=42
)

scaler = StandardScaler()
X_train_sc = scaler.fit_transform(X_train)
X_test_sc = scaler.transform(X_test)

print("\n--- Training Logistic Regression ---")
lr = LogisticRegression(max_iter=500, random_state=42)
lr.fit(X_train_sc, yc_train)
lr_pred = lr.predict(X_test_sc)
print(f"Accuracy: {accuracy_score(yc_test, lr_pred):.4f}")
print(classification_report(yc_test, lr_pred, target_names=le_risk.classes_))

print("\n--- Training Decision Tree ---")
dt = DecisionTreeClassifier(max_depth=8, random_state=42)
dt.fit(X_train_sc, yc_train)
dt_pred = dt.predict(X_test_sc)
print(f"Accuracy: {accuracy_score(yc_test, dt_pred):.4f}")

print("\n--- Training Random Forest ---")
rf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
rf.fit(X_train_sc, yc_train)
rf_pred = rf.predict(X_test_sc)
print(f"Accuracy: {accuracy_score(yc_test, rf_pred):.4f}")

print("\n--- Training Linear Regression (Score Prediction) ---")
linreg = LinearRegression()
linreg.fit(X_train_sc, yr_train)
yr_pred = linreg.predict(X_test_sc)
mse = mean_squared_error(yr_test, yr_pred)
r2 = r2_score(yr_test, yr_pred)
print(f"MSE: {mse:.4f}  |  R2: {r2:.4f}")

print("\nSaving models...")
with open("backend/models/saved/logistic_regression.pkl","wb") as f: pickle.dump(lr, f)
with open("backend/models/saved/decision_tree.pkl","wb") as f: pickle.dump(dt, f)
with open("backend/models/saved/random_forest.pkl","wb") as f: pickle.dump(rf, f)
with open("backend/models/saved/linear_regression.pkl","wb") as f: pickle.dump(linreg, f)
with open("backend/models/saved/scaler.pkl","wb") as f: pickle.dump(scaler, f)
with open("backend/models/saved/label_encoder_risk.pkl","wb") as f: pickle.dump(le_risk, f)
with open("backend/models/saved/label_encoder_weak.pkl","wb") as f: pickle.dump(le_weak, f)

print("\nAll models saved to backend/models/saved/")
print("Training complete!")
