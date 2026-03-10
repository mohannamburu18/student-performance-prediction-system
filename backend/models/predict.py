import pickle
import numpy as np
import os

MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved")

def load(name):
    with open(os.path.join(MODEL_DIR, name), "rb") as f:
        return pickle.load(f)

def predict_student(data: dict):
    scaler = load("scaler.pkl")
    rf = load("random_forest.pkl")
    linreg = load("linear_regression.pkl")
    le_risk = load("label_encoder_risk.pkl")
    le_weak = load("label_encoder_weak.pkl")

    weak_enc = 0
    try:
        weak_enc = le_weak.transform([data.get("weak_subjects", "None")])[0]
    except:
        weak_enc = 0

    features = np.array([[
        data["study_hours"],
        data["sleep_hours"],
        data["screen_time"],
        data["prev_semester_score"],
        data["attendance"],
        data["weekly_test_score"],
        data["assignment_score"],
        weak_enc
    ]])

    features_sc = scaler.transform(features)
    risk_enc = rf.predict(features_sc)[0]
    risk_proba = rf.predict_proba(features_sc)[0]
    risk_label = le_risk.inverse_transform([risk_enc])[0]
    predicted_score = float(linreg.predict(features_sc)[0])
    predicted_score = max(0, min(100, predicted_score))

    classes = le_risk.classes_.tolist()
    confidence = {classes[i]: round(float(risk_proba[i]) * 100, 1) for i in range(len(classes))}

    reasons = []
    if data["study_hours"] < 3:
        reasons.append("Low study hours (< 3 hrs/day)")
    if data["sleep_hours"] < 6:
        reasons.append("Insufficient sleep (< 6 hrs)")
    if data["screen_time"] > 5:
        reasons.append("High screen time (> 5 hrs)")
    if data["attendance"] < 75:
        reasons.append("Low attendance (< 75%)")
    if data["weekly_test_score"] < 50:
        reasons.append("Poor weekly test performance")
    if data["assignment_score"] < 50:
        reasons.append("Low assignment scores")
    if not reasons:
        reasons.append("Performance within acceptable range")

    return {
        "risk_level": risk_label,
        "predicted_score": round(predicted_score, 2),
        "confidence": confidence,
        "reasons": reasons
    }

def predict_admin(data: dict):
    scaler = load("scaler.pkl")
    rf = load("random_forest.pkl")
    linreg = load("linear_regression.pkl")
    le_risk = load("label_encoder_risk.pkl")

    features = np.array([[
        data.get("study_hours", 5),
        data.get("sleep_hours", 7),
        data.get("screen_time", 3),
        data["prev_semester_score"],
        data["attendance"],
        data["weekly_test_score"],
        data["assignment_score"],
        0
    ]])

    features_sc = scaler.transform(features)
    risk_enc = rf.predict(features_sc)[0]
    risk_label = le_risk.inverse_transform([risk_enc])[0]
    predicted_score = float(linreg.predict(features_sc)[0])
    predicted_score = max(0, min(100, predicted_score))

    actions = []
    if risk_label == "High":
        actions = [
            "Schedule immediate academic counseling session",
            "Notify parents/guardians about performance",
            "Assign a peer mentor",
            "Create a supervised study schedule"
        ]
    elif risk_label == "Medium":
        actions = [
            "Monitor attendance and test scores weekly",
            "Encourage participation in doubt-clearing sessions",
            "Set short-term performance goals"
        ]
    else:
        actions = [
            "Maintain current performance trajectory",
            "Encourage participation in advanced programs"
        ]

    return {
        "risk_level": risk_label,
        "predicted_score": round(predicted_score, 2),
        "early_warning": risk_label in ["High", "Medium"],
        "suggested_actions": actions
    }
