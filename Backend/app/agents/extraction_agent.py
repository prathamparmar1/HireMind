import json
import re
from app.services.gemini_client import call_gemini

def extract_candidate_info(resume_text: str) -> dict:
    prompt = f"""
You are a resume parsing assistant. Read the resume text below and extract information.

Return ONLY a valid JSON object with this exact structure, no extra text, no markdown formatting:

{{
  "name": "candidate full name or null",
  "email": "candidate email or null",
  "skills": ["skill1", "skill2"],
  "experience_years": "total years of experience as a string, e.g. '3 years' or null",
  "projects": ["short project description 1", "short project description 2"],
  "education": "highest education detail as a string or null",
  "companies": ["company1", "company2"]
}}

Resume text:
{resume_text}
"""

    raw_response = call_gemini(prompt)

    cleaned = re.sub(r"^```json\s*|\s*```$", "", raw_response.strip())

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        data = {
            "name": None,
            "email": None,
            "skills": [],
            "experience_years": None,
            "projects": [],
            "education": None,
            "companies": []
        }

    return data