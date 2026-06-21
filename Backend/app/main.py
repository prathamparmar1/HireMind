from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.models import job, candidate
from app.routes import job_routes

app = FastAPI(title="HireMind AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(job_routes.router)

@app.get("/")
def root():
    return {"message": "HireMind AI backend is running"}