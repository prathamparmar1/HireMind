from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Date
from sqlalchemy.sql import func
from app.database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)
    location = Column(String, nullable=False)
    work_mode = Column(String, nullable=False)
    employment_type = Column(String, nullable=False)
    min_experience = Column(Float, nullable=False)
    max_experience = Column(Float, nullable=False)
    required_skills = Column(Text, nullable=False)

    preferred_skills = Column(Text, nullable=True)
    education_requirement = Column(String, nullable=True)
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    openings = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    application_deadline = Column(Date, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())