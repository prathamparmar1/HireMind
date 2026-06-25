from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
import time

from app.database import get_db
from app.models.candidate import Candidate
from app.models.job import Job
from app.agents.extraction_agent import extract_candidate_info
from app.agents.matching_agent import match_candidate_to_job
from app.schemas import CandidateResponse

router = APIRouter(prefix="/processing", tags=["Processing"])
from app.schemas import CandidateIdsRequest

@router.post("/extract/{job_id}", response_model=List[CandidateResponse])
def extract_candidates(job_id: int, payload: CandidateIdsRequest = None, db: Session = Depends(get_db)):
    query = db.query(Candidate).filter(
        Candidate.job_id == job_id,
        Candidate.extracted_skills.is_(None)
    )

    if payload and payload.candidate_ids:
        query = query.filter(Candidate.id.in_(payload.candidate_ids))

    candidates = query.all()

    if not candidates:
        raise HTTPException(status_code=404, detail="No unprocessed candidates found for this job")

    processed = []
    failed_ids = []

    for i, candidate in enumerate(candidates):
        try:
            info = extract_candidate_info(candidate.resume_text)

            candidate.name = info.get("name")
            candidate.email = info.get("email")
            candidate.extracted_skills = json.dumps(info.get("skills", []))
            candidate.extracted_experience = info.get("experience_years")
            candidate.extracted_projects = json.dumps(info.get("projects", []))
            candidate.extracted_education = info.get("education")

            db.commit()
            db.refresh(candidate)
            processed.append(candidate)

        except Exception as e:
            print(f"[Extraction Failed] Candidate {candidate.id}: {e}")
            db.rollback()
            failed_ids.append(candidate.id)

        if i < len(candidates) - 1:
            time.sleep(13)

    if not processed and failed_ids:
        raise HTTPException(
            status_code=502,
            detail=f"All extractions failed. Candidate IDs: {failed_ids}. Try again later."
        )

    return processed


@router.post("/match/{job_id}", response_model=List[CandidateResponse])
def match_candidates(job_id: int, payload: CandidateIdsRequest = None, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    query = db.query(Candidate).filter(
        Candidate.job_id == job_id,
        Candidate.extracted_skills.isnot(None),
        Candidate.match_score.is_(None)
    )

    if payload and payload.candidate_ids:
        query = query.filter(Candidate.id.in_(payload.candidate_ids))

    candidates = query.all()

    if not candidates:
        raise HTTPException(status_code=404, detail="No candidates ready for matching. Run extraction first.")

    processed = []
    failed_ids = []

    for i, candidate in enumerate(candidates):
        try:
            candidate_data = {
                "skills": json.loads(candidate.extracted_skills or "[]"),
                "experience": candidate.extracted_experience,
                "projects": json.loads(candidate.extracted_projects or "[]"),
                "education": candidate.extracted_education,
                "companies": []
            }

            job_context = job.description if job.description else f"{job.title} role requiring: {job.required_skills}"
            result = match_candidate_to_job(job_context, job.required_skills, candidate_data)

            candidate.match_score = result.get("match_score", 0)
            candidate.match_reasons = json.dumps({
                "reasons": result.get("reasons", []),
                "missing_skills": result.get("missing_skills", [])
            })

            db.commit()
            db.refresh(candidate)
            processed.append(candidate)

        except Exception as e:
            print(f"[Matching Failed] Candidate {candidate.id}: {e}")
            db.rollback()
            failed_ids.append(candidate.id)

        if i < len(candidates) - 1:
            time.sleep(13)

    if not processed and failed_ids:
        raise HTTPException(
            status_code=502,
            detail=f"All matches failed. Candidate IDs: {failed_ids}. Try again later."
        )

    return processed