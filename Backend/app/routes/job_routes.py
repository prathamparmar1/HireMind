from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.job import Job
from app.schemas import JobCreate, JobResponse

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.post("/", response_model=JobResponse)
def create_job(job_data: JobCreate, db: Session = Depends(get_db)):
    new_job = Job(
        title=job_data.title,
        location=job_data.location,
        work_mode=job_data.work_mode,
        employment_type=job_data.employment_type,
        min_experience=job_data.min_experience,
        max_experience=job_data.max_experience,
        required_skills=job_data.required_skills,
        preferred_skills=job_data.preferred_skills,
        education_requirement=job_data.education_requirement,
        salary_min=job_data.salary_min,
        salary_max=job_data.salary_max,
        openings=job_data.openings,
        description=job_data.description,
        application_deadline=job_data.application_deadline
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

@router.get("/", response_model=List[JobResponse])
def get_all_jobs(db: Session = Depends(get_db)):
    jobs = db.query(Job).order_by(Job.created_at.desc()).all()
    return jobs

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job