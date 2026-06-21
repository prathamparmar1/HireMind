from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json

from app.database import get_db
from app.models.candidate import Candidate
from app.agents.extraction_agent import extract_candidate_info
from app.schemas import CandidateResponse

router = APIRouter(prefix="/processing", tags=["Processing"])

@router.post("/extract/{job_id}", response_model=List[CandidateResponse])
def extract_candidates(job_id: int, db: Session = Depends(get_db)):
    candidates = db.query(Candidate).filter(
        Candidate.job_id == job_id,
        Candidate.extracted_skills.is_(None)
    ).all()

    if not candidates:
        raise HTTPException(status_code=404, detail="No unprocessed candidates found for this job")

    processed = []

    for candidate in candidates:
        info = extract_candidate_info(candidate.resume_text)

        candidate.name = info.get("name")
        candidate.email = info.get("email")
        candidate.extracted_skills = json.dumps(info.get("skills", []))
        candidate.extracted_experience = info.get("experience_years")
        candidate.extracted_projects = json.dumps(info.get("projects", []))
        candidate.extracted_education = info.get("education")

        processed.append(candidate)

    db.commit()

    for candidate in processed:
        db.refresh(candidate)

    return processed