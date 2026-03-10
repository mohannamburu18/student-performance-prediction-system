from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database.db import create_tables
from backend.auth.routes import router as auth_router
from backend.routes.student import router as student_router
from backend.routes.admin import router as admin_router

app = FastAPI(
    title="Student Performance Prediction & Early Warning System",
    description="ML-powered academic risk prediction with personalized recommendations",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    create_tables()
    print("Database tables created.")

app.include_router(auth_router)
app.include_router(student_router)
app.include_router(admin_router)

@app.get("/")
def root():
    return {
        "message": "Student Performance Prediction API",
        "docs": "/docs",
        "version": "1.0.0"
    }
