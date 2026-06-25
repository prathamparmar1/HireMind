from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.job import Job
from sqlalchemy import func
from app.models.candidate import Candidate
from app.schemas import JobCreate, JobResponse, JobListItem

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

@router.get("/", response_model=List[JobListItem])
def get_all_jobs(db: Session = Depends(get_db)):
    jobs = db.query(Job).order_by(Job.created_at.desc()).all()

    result = []
    for job in jobs:
        stats = db.query(
            func.count(Candidate.id).label("count"),
            func.avg(Candidate.match_score).label("avg_score"),
            func.max(Candidate.match_score).label("top_score"),
        ).filter(Candidate.job_id == job.id).first()

        result.append(JobListItem(
            id=job.id,
            title=job.title,
            location=job.location,
            work_mode=job.work_mode,
            employment_type=job.employment_type,
            min_experience=job.min_experience,
            max_experience=job.max_experience,
            required_skills=job.required_skills,
            created_at=job.created_at,
            candidate_count=stats.count or 0,
            avg_score=round(stats.avg_score, 1) if stats.avg_score else None,
            top_score=stats.top_score,
        ))

    return result

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job