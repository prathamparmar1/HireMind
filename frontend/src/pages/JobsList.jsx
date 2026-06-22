import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllJobs } from "../api/jobs";

function JobsList() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await getAllJobs();
      setJobs(data);
    } catch (err) {
      setError("Could not load jobs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="dashboard-top-bar">
        <h1>Job Postings</h1>
        <button onClick={() => navigate("/create-job")}>
          + Create New Job
        </button>
      </div>

      {loading && <p>Loading jobs...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && jobs.length === 0 && (
        <p className="empty-state">No jobs yet. Create your first job posting to get started.</p>
      )}

      <div className="job-list">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="job-list-item"
            onClick={() => navigate(`/jobs/${job.id}/candidates`)}
          >
            <h3>{job.title}</h3>
            <p className="job-location">{job.location || "Remote / Not specified"}</p>
            <p className="skills-tag">{job.required_skills}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JobsList;