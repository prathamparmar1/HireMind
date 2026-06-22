import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRankedCandidates } from "../api/candidates";
import { getJobById } from "../api/jobs";
import CandidateCard from "../components/CandidateCard";

function CandidateDashboard() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [jobData, candidatesData] = await Promise.all([
        getJobById(jobId),
        getRankedCandidates(jobId),
      ]);
      setJob(jobData);
      setCandidates(candidatesData);
    } catch (err) {
      setError("Could not load candidates. Try processing resumes first.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading candidates...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      {job && (
        <div className="job-header">
          <h1>{job.title}</h1>
          <p className="subtitle">{job.location}</p>
          <p className="skills-tag">Required: {job.required_skills}</p>
        </div>
      )}

      <div className="dashboard-top-bar">
        <h2>{candidates.length} Ranked Candidate{candidates.length !== 1 ? "s" : ""}</h2>
        <button onClick={() => navigate(`/jobs/${jobId}/upload`)}>
          Upload More Resumes
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {candidates.length === 0 && !error && (
        <p className="empty-state">No ranked candidates yet. Upload and process resumes first.</p>
      )}

      <div className="candidate-list">
        {candidates.map((candidate, index) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            rank={index + 1}
          />
        ))}
      </div>
    </div>
  );
}

export default CandidateDashboard;