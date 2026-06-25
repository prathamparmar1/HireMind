import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getAllJobs } from "../api/jobs";
import "./JobsList.css";

function timeAgo(dateString) {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function scoreTier(score) {
  if (score === null || score === undefined) return "none";
  if (score >= 80) return "high";
  if (score >= 60) return "mid";
  return "low";
}

function JobCard({ job, onClick }) {
  const skills = job.required_skills
    ? job.required_skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const tier = scoreTier(job.top_score);

  return (
    <div className="job-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="job-card-top">
        <h3>{job.title}</h3>
        <span className="job-card-time">{timeAgo(job.created_at)}</span>
      </div>

      <div className="job-card-meta">
        <span className="meta-pill">{job.location}</span>
        <span className="meta-pill">{job.work_mode}</span>
        <span className="meta-pill">{job.employment_type}</span>
        <span className="meta-pill muted">
          {job.min_experience}–{job.max_experience} yrs
        </span>
      </div>

      <div className="job-card-skills">
        {skills.slice(0, 4).map((s) => (
          <span className="skill-chip" key={s}>{s}</span>
        ))}
        {skills.length > 4 && <span className="skill-chip more">+{skills.length - 4}</span>}
      </div>

      <div className="job-card-stats">
        <div className="stat-block">
          <span className="stat-value">{job.candidate_count}</span>
          <span className="stat-label">
            candidate{job.candidate_count !== 1 ? "s" : ""}
          </span>
        </div>

        {job.top_score !== null ? (
          <>
            <div className="stat-divider" />
            <div className="stat-block">
              <span className={`stat-value score-${tier}`}>{job.top_score}%</span>
              <span className="stat-label">top score</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-block">
              <span className="stat-value">{job.avg_score}%</span>
              <span className="stat-label">avg score</span>
            </div>
          </>
        ) : (
          <>
            <div className="stat-divider" />
            <span className="stat-pending">
              {job.candidate_count > 0 ? "Not yet scored" : "Awaiting resumes"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function JobsList() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [workModeFilter, setWorkModeFilter] = useState("All");

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await getAllJobs();
      setJobs(data);
    } catch (err) {
      setError("Could not load jobs. Check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const workModes = useMemo(() => {
    const modes = new Set(jobs.map((j) => j.work_mode));
    return ["All", ...modes];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.location.toLowerCase().includes(search.toLowerCase());
      const matchesMode = workModeFilter === "All" || job.work_mode === workModeFilter;
      return matchesSearch && matchesMode;
    });
  }, [jobs, search, workModeFilter]);

  const totalCandidates = jobs.reduce((sum, j) => sum + j.candidate_count, 0);

  return (
    <div className="jobs-page">
      <div className="jobs-header">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>Job postings</h1>
        </div>
        <button className="btn-primary btn-large" onClick={() => navigate("/create-job")}>
          + Create new job
        </button>
      </div>

      {!loading && jobs.length > 0 && (
        <div className="jobs-summary-bar">
          <div className="summary-stat">
            <span className="summary-value">{jobs.length}</span>
            <span className="summary-label">open role{jobs.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="summary-divider" />
          <div className="summary-stat">
            <span className="summary-value">{totalCandidates}</span>
            <span className="summary-label">candidates processed</span>
          </div>
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <div className="jobs-controls">
          <input
            type="text"
            className="jobs-search"
            placeholder="Search by title or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="jobs-filter-pills">
            {workModes.map((mode) => (
              <button
                key={mode}
                className={`filter-pill ${workModeFilter === mode ? "active" : ""}`}
                onClick={() => setWorkModeFilter(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="jobs-grid">
          {[1, 2, 3].map((i) => (
            <div className="job-card skeleton" key={i}>
              <div className="skeleton-line short" />
              <div className="skeleton-line" />
              <div className="skeleton-line medium" />
            </div>
          ))}
        </div>
      )}

      {error && <p className="jobs-error">{error}</p>}

      {!loading && jobs.length === 0 && !error && (
        <div className="empty-state">
          <span className="empty-icon">⌗</span>
          <h2>No job postings yet</h2>
          <p>Create your first role and start uploading resumes to get a ranked shortlist.</p>
          <button className="btn-primary btn-large" onClick={() => navigate("/create-job")}>
            Create your first job
          </button>
        </div>
      )}

      {!loading && jobs.length > 0 && filteredJobs.length === 0 && (
        <div className="empty-state small">
          <p>No jobs match your search or filter.</p>
        </div>
      )}

      {!loading && filteredJobs.length > 0 && (
        <div className="jobs-grid">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onClick={() => navigate(`/jobs/${job.id}/candidates`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default JobsList;
