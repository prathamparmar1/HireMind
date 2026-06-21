from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.candidate import Candidate
from app.models.job import Job
from app.services.resume_parser import extract_resume_text
from app.schemas import CandidateResponse

router = APIRouter(prefix="/resumes", tags=["Resumes"])

@router.post("/upload/{job_id}", response_model=List[CandidateResponse])
async def upload_resumes(
    job_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    created_candidates = []

    for file in files:
        try:
            file_bytes = await file.read()
            resume_text = extract_resume_text(file.filename, file_bytes)

            if not resume_text:
                continue

            new_candidate = Candidate(
                job_id=job_id,
                resume_text=resume_text
            )
            db.add(new_candidate)
            created_candidates.append(new_candidate)

        except ValueError:
            continue

    db.commit()

    for candidate in created_candidates:
        db.refresh(candidate)

    return created_candidates