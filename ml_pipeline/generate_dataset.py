import pandas as pd
import numpy as np
import os

np.random.seed(42)
n = 1000

study_hours = np.random.uniform(1, 10, n)
sleep_hours = np.random.uniform(4, 9, n)
screen_time = np.random.uniform(1, 8, n)
prev_semester_score = np.random.uniform(40, 100, n)
attendance = np.random.uniform(50, 100, n)
weekly_test_score = np.random.uniform(30, 100, n)
assignment_score = np.random.uniform(40, 100, n)

performance_score = (
    0.25 * study_hours * 10 +
    0.15 * sleep_hours * 10 +
    -0.10 * screen_time * 10 +
    0.20 * prev_semester_score +
    0.10 * attendance +
    0.10 * weekly_test_score +
    0.10 * assignment_score +
    np.random.normal(0, 5, n)
)
performance_score = np.clip(performance_score, 0, 100)

def risk_label(score):
    if score < 50:
        return "High"
    elif score < 70:
        return "Medium"
    else:
        return "Low"

risk_level = [risk_label(s) for s in performance_score]

weak_subjects_pool = ["Math", "Physics", "Chemistry", "English", "CS", "None"]
weak_subjects = np.random.choice(weak_subjects_pool, n)

df = pd.DataFrame({
    "study_hours": study_hours.round(2),
    "sleep_hours": sleep_hours.round(2),
    "screen_time": screen_time.round(2),
    "prev_semester_score": prev_semester_score.round(2),
    "attendance": attendance.round(2),
    "weekly_test_score": weekly_test_score.round(2),
    "assignment_score": assignment_score.round(2),
    "weak_subjects": weak_subjects,
    "performance_score": performance_score.round(2),
    "risk_level": risk_level
})

os.makedirs("ml_pipeline/dataset", exist_ok=True)
df.to_csv("ml_pipeline/dataset/student_data.csv", index=False)
print(f"Dataset generated: {len(df)} rows")
print(df["risk_level"].value_counts())
