import json
import re
from app.services.gemini_client import call_gemini

def match_candidate_to_job(job_description: str, required_skills: str, candidate_data: dict) -> dict:
    prompt = f"""
You are an expert technical recruiter. Compare this candidate to this job and give an honest match assessment.

Job Description:
{job_description}

Required Skills:
{required_skills}

Candidate Profile:
Skills: {candidate_data.get('skills')}
Experience: {candidate_data.get('experience')}
Projects: {candidate_data.get('projects')}
Education: {candidate_data.get('education')}
Companies: {candidate_data.get('companies')}

Return ONLY a valid JSON object with this exact structure, no extra text, no markdown formatting:

{{
  "match_score": 85,
  "reasons": ["short reason 1", "short reason 2", "short reason 3"],
  "missing_skills": ["skill1", "skill2"]
}}

match_score must be an integer from 0 to 100 based on real fit, not just keyword overlap.
Be honest and critical, not generous.
"""

    raw_response = call_gemini(prompt)
    cleaned = re.sub(r"^```json\s*|\s*```$", "", raw_response.strip())

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        data = {
            "match_score": 0,
            "reasons": ["Could not evaluate this candidate due to a processing error"],
            "missing_skills": []
        }

    return data