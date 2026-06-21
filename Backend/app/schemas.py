from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class JobCreate(BaseModel):
    title: str
    description: str
    required_skills: str
    location: Optional[str] = None

class JobResponse(BaseModel):
    id: int
    title: str
    description: str
    required_skills: str
    location: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class CandidateResponse(BaseModel):
    id: int
    job_id: int
    name: Optional[str]
    email: Optional[str]
    extracted_skills: Optional[str]
    extracted_experience: Optional[str]
    extracted_projects: Optional[str]
    extracted_education: Optional[str]
    match_score: Optional[float]
    match_reasons: Optional[str]
    interview_questions: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True