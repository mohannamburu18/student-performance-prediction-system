from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from backend.auth.utils import get_current_user
from backend.models.predict import predict_admin

router = APIRouter(prefix="/admin", tags=["Admin"])

class AdminInput(BaseModel):
    student_name: str
    roll_number: str
    prev_semester_score: float
    attendance: float
    weekly_test_score: float
    assignment_score: float
    monthly_scores: Optional[List[float]] = []

@router.post("/predict")
def admin_predict(data: AdminInput, user=Depends(get_current_user)):
    input_dict = data.dict()
    prediction = predict_admin(input_dict)

    # Build performance graph data (actual + projected)
    months = ["Jan","Feb","Mar","Apr","May","Jun"]
    actual = data.monthly_scores if data.monthly_scores else []
    
    # Project future months using simple trend
    if actual:
        trend = (actual[-1] - actual[0]) / max(len(actual), 1)
        projected = [round(min(100, actual[-1] + trend * (i+1)), 2) for i in range(6 - len(actual))]
    else:
        base = data.prev_semester_score
        projected = [round(min(100, base + i * 1.5), 2) for i in range(6)]

    graph_data = []
    for i, m in enumerate(months):
        entry = {"month": m}
        if i < len(actual):
            entry["actual"] = actual[i]
        else:
            entry["projected"] = projected[i - len(actual)]
        graph_data.append(entry)

    return {
        "admin": user.get("sub"),
        "student_name": data.student_name,
        "roll_number": data.roll_number,
        "prediction": prediction,
        "performance_graph": graph_data
    }

@router.get("/students/at-risk")
def get_at_risk_summary(user=Depends(get_current_user)):
    # Demo endpoint — in production, query DB for all predictions
    return {
        "message": "Query the /admin/predict endpoint per student to get live predictions.",
        "hint": "Integrate DB to store and retrieve all student predictions here."
    }
