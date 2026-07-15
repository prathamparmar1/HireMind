# HireMind AI — AI-Powered Recruiting Intelligence System

> Upload resumes and a job description. HireMind extracts every candidate profile, scores applicants against the role, identifies skill gaps, and surfaces your strongest matches — automatically.

**Live Demo:** [hiremind.vercel.app](https://hire-mind-xi.vercel.app/) &nbsp;&nbsp; 

---

## The Problem This Solves

Traditional resume screening has three hard problems:

- **Volume** — a single backend role can attract 1,000+ applicants. No recruiter reads all of them carefully.
- **Inconsistency** — two recruiters reviewing the same resume reach different verdicts. Screening isn't a process, it's a guess.
- **Keyword bias** — ATS systems match resumes on buzzword overlap, not actual capability. A candidate who "built REST APIs at scale for 3 years" and one who listed "REST APIs" on a tutorial project score identically.

HireMind addresses the third problem specifically. Instead of counting keywords, the system reads the full resume text, understands the depth and context of what the candidate has actually built, and reasons about fit against the role — the same way a strong technical recruiter would, but in seconds per candidate.

---

## Demo

| Screen | What it shows |
|---|---|
| **Jobs dashboard** | All open roles with candidate counts, top scores, and pipeline status at a glance |
| **Create job** | Full role specification — skills, experience range, work mode, salary, deadline |
| **Upload resumes** | Drag-and-drop PDF/DOCX with live pipeline tracker (Upload → Extract → Match) |
| **Candidate dashboard** | Ranked shortlist with score distribution, tier filters, and expandable profiles |
| **Pipeline manager** | Manual retry controls for candidates stuck at any stage due to API failures |

---

## System Architecture

```
Resume Upload (PDF/DOCX)
        ↓
[FastAPI — REST API Layer]
        ↓
[Resume Parser]
PyMuPDF / python-docx → raw text extraction
        ↓
[Extraction Agent — Gemini 2.5 Flash]
Prompt → structured JSON: name, skills, experience, projects, education
        ↓
[PostgreSQL — NeonDB]
Candidate row saved with extracted profile
        ↓
[Matching Agent — Gemini 2.5 Flash]
Job context + candidate profile → match score (0-100) + reasons + missing skills
        ↓
[Ranked Candidate API]
Sorted by score, served to React dashboard
```

Each stage is a separate, independently retryable step. A failure at matching does not lose extraction work. A failure on one candidate does not affect others in the same batch.

---

## Tech Stack

**Backend**
- Python, FastAPI
- SQLAlchemy ORM, Alembic migrations
- PostgreSQL (NeonDB — managed, serverless)
- Google Gemini 2.5 Flash (`google-genai` SDK)
- PyMuPDF, python-docx (resume text extraction)

**Frontend**
- React 18, Vite
- React Router v6
- Axios
- Pure CSS with CSS custom properties (no UI library)

**Infrastructure**
- Backend: Render (Python web service)
- Frontend: Vercel
- Database: NeonDB (serverless PostgreSQL)
- Environment-based config via `.env` / Render environment variables

---

## Key Engineering Decisions

**Per-candidate database commits inside the processing loop**

Most pipelines batch everything and commit once at the end. This means one failed API call loses all progress. HireMind commits each candidate individually inside a `try/except` — failed candidates roll back cleanly, successful ones are permanently saved. The next run automatically picks up only the ones that failed.

```python
for candidate in candidates:
    try:
        info = extract_candidate_info(candidate.resume_text)
        # ... update fields ...
        db.commit()
        db.refresh(candidate)
    except Exception as e:
        db.rollback()
        failed_ids.append(candidate.id)
```

**Rate limit resilience with controlled backoff**

Gemini's free tier enforces per-minute and per-day request limits. The Gemini client implements its own retry loop with `time.sleep(20)` between attempts, and `time.sleep(13)` between candidates in the processing loop. This keeps the system functional on free tier without requiring a task queue.

**Targeted reprocessing via candidate IDs**

Both extraction and matching endpoints accept an optional `candidate_ids` list. When provided, only those specific candidates are processed — enabling the frontend's Pipeline Manager to retry exactly the stuck ones without re-running the entire job batch. When omitted, the endpoints fall back to processing all eligible candidates, preserving the automatic upload flow.

```python
@router.post("/extract/{job_id}")
def extract_candidates(job_id: int, payload: CandidateIdsRequest = None, db: Session = Depends(get_db)):
    query = db.query(Candidate).filter(
        Candidate.job_id == job_id,
        Candidate.extracted_skills.is_(None)
    )
    if payload and payload.candidate_ids:
        query = query.filter(Candidate.id.in_(payload.candidate_ids))
```

**Race condition prevention in React data fetching**

When navigating between jobs quickly, an in-flight request for job A can resolve after job B's data has already loaded, overwriting the correct state. An `isCurrent` flag scoped to each `useEffect` run prevents stale responses from applying:

```javascript
useEffect(() => {
  let isCurrent = true;
  const loadData = async () => {
    const data = await fetchCandidates(jobId);
    if (!isCurrent) return;
    setCandidates(data);
  };
  loadData();
  return () => { isCurrent = false; };
}, [jobId, reloadTrigger]);
```

**NeonDB connection pool configuration**

Serverless databases close idle connections aggressively. SQLAlchemy's default pool holds onto dead connections and crashes on the next query. `pool_pre_ping=True` sends a cheap `SELECT 1` before every connection use — if NeonDB closed it, SQLAlchemy opens a fresh one silently instead of throwing an error.

```python
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=5,
    max_overflow=2,
)
```

---

## Project Structure

```
hiremind/
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   │   ├── extraction_agent.py     # Resume → structured JSON via Gemini
│   │   │   └── matching_agent.py       # Candidate + JD → score + reasons via Gemini
│   │   ├── models/
│   │   │   ├── job.py                  # Job posting schema
│   │   │   └── candidate.py            # Candidate + pipeline state schema
│   │   ├── routes/
│   │   │   ├── job_routes.py           # CRUD for job postings
│   │   │   ├── resume_routes.py        # Upload, ranked list, all candidates
│   │   │   └── processing_routes.py    # Extract and match endpoints
│   │   ├── services/
│   │   │   ├── gemini_client.py        # Gemini API wrapper with retry logic
│   │   │   └── resume_parser.py        # PDF and DOCX text extraction
│   │   ├── database.py                 # SQLAlchemy engine + session
│   │   ├── schemas.py                  # Pydantic request/response models
│   │   └── main.py                     # FastAPI app, CORS, router registration
│   ├── requirements.txt
│   └── Procfile
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── client.js               # Axios instance with VITE_API_URL
    │   │   ├── jobs.js                 # Job API functions
    │   │   └── candidates.js           # Candidate API functions
    │   ├── components/
    │   │   ├── TagInput.jsx            # Reusable skill tag input
    │   │   └── PipelineManager.jsx     # Manual retry UI for stuck candidates
    │   └── pages/
    │       ├── Landing.jsx             # Marketing landing page
    │       ├── JobsList.jsx            # Jobs dashboard with stats
    │       ├── CreateJob.jsx           # Multi-field job creation form
    │       ├── UploadResumes.jsx       # File upload with live pipeline tracker
    │       └── CandidateDashboard.jsx  # Ranked candidates with tier filters
    └── vercel.json
```

---

## Running Locally

**Prerequisites:** Python 3.11+, Node.js 18+, PostgreSQL

**Backend**

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/hiremind
GEMINI_API_KEY=your_gemini_api_key_here
```

```bash
uvicorn app.main:app --reload
# API running at http://127.0.0.1:8000
# Swagger docs at http://127.0.0.1:8000/docs
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
# Running at http://localhost:5173
```

**Database**

```sql
CREATE DATABASE hiremind;
-- Tables are created automatically by SQLAlchemy on first server start
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/jobs/` | Create a job posting |
| `GET` | `/jobs/` | List all jobs with candidate stats |
| `GET` | `/jobs/{id}` | Get a single job |
| `POST` | `/resumes/upload/{job_id}` | Upload resume files |
| `GET` | `/resumes/ranked/{job_id}` | Get scored candidates, sorted by match |
| `GET` | `/resumes/all/{job_id}` | Get all candidates regardless of pipeline stage |
| `POST` | `/processing/extract/{job_id}` | Run AI extraction on unprocessed candidates |
| `POST` | `/processing/match/{job_id}` | Run AI matching on extracted candidates |

Both processing endpoints accept an optional body `{"candidate_ids": [1, 2, 3]}` to target specific candidates.

---

## What's Next

- **Async task queue** — move Gemini processing off the request/response cycle using Celery + Redis, with polling-based status updates instead of a blocking HTTP connection
- **RAG-enhanced matching** — embed job descriptions and candidate profiles into a vector store, retrieve semantically similar past successful hires as grounding context for the scoring prompt
- **Candidate application portal** — let candidates apply directly instead of recruiters uploading resumes manually, completing the full recruiting workflow
- **Interview question generation** — per-candidate questions based on their specific projects and experience gaps, generated automatically after matching

---

## About

Built as a technical portfolio project to demonstrate full-stack AI system design — not a tutorial reproduction, but a working system with real engineering decisions, real bugs diagnosed and fixed, and a complete deployment pipeline.

**Pratham Parmar**
[Portfolio](https://prathamparmar-portfolio.vercel.app) · [GitHub](https://github.com/prathamparmar1) · [LinkedIn](https://linkedin.com/in/prathamparmar1)
