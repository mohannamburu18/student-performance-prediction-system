from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from backend.auth.utils import get_current_user
from backend.models.predict import predict_student
from backend.models.recommendation import generate_recommendations

router = APIRouter(prefix="/student", tags=["Student"])

class StudentInput(BaseModel):
    study_hours: float
    sleep_hours: float
    screen_time: float
    prev_semester_score: float
    attendance: float
    weekly_test_score: float
    assignment_score: float
    weak_subjects: Optional[str] = "None"

@router.post("/predict")
def student_predict(data: StudentInput, user=Depends(get_current_user)):
    input_dict = data.dict()
    prediction = predict_student(input_dict)
    recommendations = generate_recommendations(input_dict, prediction["risk_level"])
    return {
        "student": user.get("sub"),
        "prediction": prediction,
        "recommendations": recommendations
    }
