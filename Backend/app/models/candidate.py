from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)

    name = Column(String, nullable=True)
    email = Column(String, nullable=True)

    resume_text = Column(Text, nullable=True)
    extracted_skills = Column(Text, nullable=True)
    extracted_experience = Column(Text, nullable=True)
    extracted_projects = Column(Text, nullable=True)
    extracted_education = Column(Text, nullable=True)

    match_score = Column(Float, nullable=True)
    match_reasons = Column(Text, nullable=True)

    interview_questions = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())