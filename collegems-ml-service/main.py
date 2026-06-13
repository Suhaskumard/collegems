from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import random

app = FastAPI(
    title="CollegeMS AI Analytics API",
    description="Provides machine learning predictions for student dropout risk and performance forecasting.",
    version="1.0.0"
)

class StudentData(BaseModel):
    student_id: str
    attendance_percentage: float
    average_internal_marks: float
    previous_gpa: float | None = None
    missed_assessments: int

class PredictionResponse(BaseModel):
    student_id: str
    dropout_risk_score: float
    risk_level: str
    predicted_grade: str
    recommended_interventions: list[str]

# For phase 1, we use heuristics and random values to mock the ML model output.
# In a real deployment, you would load a trained model (e.g., joblib.load('model.pkl'))
def mock_predict_dropout(data: StudentData) -> float:
    risk = 0.1
    if data.attendance_percentage < 75.0:
        risk += 0.3
    if data.average_internal_marks < 40.0:
        risk += 0.3
    if data.missed_assessments > 2:
        risk += 0.2
        
    # Add a bit of randomness to simulate ML confidence
    risk += random.uniform(-0.05, 0.05)
    return max(0.0, min(1.0, risk))

def get_risk_level(score: float) -> str:
    if score > 0.7:
        return "high"
    elif score > 0.4:
        return "medium"
    return "low"

def generate_interventions(data: StudentData, risk_level: str) -> list[str]:
    interventions = []
    if data.attendance_percentage < 75.0:
        interventions.append("Send Attendance Warning")
    if data.average_internal_marks < 40.0:
        interventions.append("Schedule Academic Counseling")
    if risk_level == "high":
        interventions.append("Assign Mentor for 1-on-1 Session")
        interventions.append("Notify Parent/Guardian")
    
    if not interventions:
        interventions.append("No action required")
        
    return interventions

@app.post("/predict/dropout", response_model=PredictionResponse)
async def predict_dropout(data: StudentData):
    try:
        # 1. Run inference
        risk_score = mock_predict_dropout(data)
        risk_level = get_risk_level(risk_score)
        
        # 2. Forecast grade (Mock logic)
        predicted_grade = "B"
        if risk_level == "high":
            predicted_grade = "F"
        elif risk_level == "medium":
            predicted_grade = "C"
        elif data.average_internal_marks > 80:
            predicted_grade = "A"
            
        # 3. Generate Interventions
        interventions = generate_interventions(data, risk_level)
        
        return PredictionResponse(
            student_id=data.student_id,
            dropout_risk_score=round(risk_score, 2),
            risk_level=risk_level,
            predicted_grade=predicted_grade,
            recommended_interventions=interventions
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "CollegeMS ML Analytics"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
