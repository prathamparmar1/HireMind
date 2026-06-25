from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

class JobCreate(BaseModel):
    title: str
    location: str
    work_mode: str
    employment_type: str
    min_experience: float
    max_experience: float
    required_skills: str
    preferred_skills: Optional[str] = None
    education_requirement: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    openings: Optional[int] = None
    description: Optional[str] = None
    application_deadline: Optional[date] = None

class JobResponse(BaseModel):
    id: int
    title: str
    location: str
    work_mode: str
    employment_type: str
    min_experience: float
    max_experience: float
    required_skills: str
    preferred_skills: Optional[str]
    education_requirement: Optional[str]
    salary_min: Optional[float]
    salary_max: Optional[float]
    openings: Optional[int]
    description: Optional[str]
    application_deadline: Optional[date]
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
        
class JobListItem(BaseModel):
    id: int
    title: str
    location: str
    work_mode: str
    employment_type: str
    min_experience: float
    max_experience: float
    required_skills: str
    created_at: datetime
    candidate_count: int
    avg_score: Optional[float] = None
    top_score: Optional[float] = None

    class Config:
        from_attributes = True

class CandidateIdsRequest(BaseModel):
    candidate_ids: List[int]