import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.models import job, candidate
from app.routes import job_routes, resume_routes, processing_routes

app = FastAPI(title="HireMind AI")

allowed_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=allowed_origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
Base.metadata.create_all(bind=engine)

app.include_router(job_routes.router)
app.include_router(resume_routes.router)
app.include_router(processing_routes.router)

@app.get("/")
def root():
    return {"message": "HireMind AI is running"}