import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobById } from "../api/jobs";
import "./CandidateDashboard.css";
import PipelineManager from "../components/PipelineManager";
import {
  getRankedCandidates,
  getAllCandidatesForJob,
  extractSpecificCandidates,
  matchSpecificCandidates,
} from "../api/candidates";

function scoreTier(score) {
  if (score >= 80) return "high";
  if (score >= 60) return "mid";
  return "low";
}

function CandidateCard({ candidate, rank, expanded, onToggle }) {
  const skills = candidate.extracted_skills ? JSON.parse(candidate.extracted_skills) : [];
  const projects = candidate.extracted_projects ? JSON.parse(candidate.extracted_projects) : [];
  const matchReasons = candidate.match_reasons
    ? JSON.parse(candidate.match_reasons)
    : { reasons: [], missing_skills: [] };

  const tier = scoreTier(candidate.match_score);

  return (
    <div className={`candidate-card ${expanded ? "is-expanded" : ""}`}>
      <div className="candidate-card-header" onClick={onToggle}>
        <span className="candidate-rank">#{rank}</span>

        <div className="candidate-avatar">
          {(candidate.name || "?")
            .split(" ")
            .map((p) => p[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>

        <div className="candidate-basic-info">
          <h3>{candidate.name || "Unnamed candidate"}</h3>
          <p className="candidate-email">{candidate.email || "No email extracted"}</p>
        </div>

        <div className="candidate-top-skills">
          {skills.slice(0, 3).map((s, i) => (
            <span className="mini-chip" key={i}>{s}</span>
          ))}
        </div>

        <div className={`candidate-score score-${tier}`}>{candidate.match_score}%</div>

        <span className="expand-toggle">{expanded ? "−" : "+"}</span>
      </div>

      {expanded && (
        <div className="candidate-card-details">
          <div className="detail-grid">
            <div className="detail-section">
              <h4>Skills</h4>
              <div className="skill-tags">
                {skills.length > 0 ? (
                  skills.map((skill, i) => (
                    <span key={i} className="skill-tag">{skill}</span>
                  ))
                ) : (
                  <span className="detail-empty">No skills extracted</span>
                )}
              </div>
            </div>

            <div className="detail-section">
              <h4>Experience</h4>
              <p>{candidate.extracted_experience || "Not specified"}</p>
            </div>

            <div className="detail-section">
              <h4>Education</h4>
              <p>{candidate.extracted_education || "Not specified"}</p>
            </div>
          </div>

          <div className="detail-section">
            <h4>Projects</h4>
            {projects.length > 0 ? (
              <ul>
                {projects.map((project, i) => (
                  <li key={i}>{project}</li>
                ))}
              </ul>
            ) : (
              <span className="detail-empty">No projects extracted</span>
            )}
          </div>

          <div className="detail-grid two-col">
            <div className="detail-section reasoning">
              <h4>Why this score</h4>
              <ul>
                {matchReasons.reasons.length > 0 ? (
                  matchReasons.reasons.map((reason, i) => <li key={i}>{reason}</li>)
                ) : (
                  <span className="detail-empty">No reasoning available</span>
                )}
              </ul>
            </div>

            <div className="detail-section">
              <h4>Missing skills</h4>
              {matchReasons.missing_skills.length > 0 ? (
                <div className="skill-tags">
                  {matchReasons.missing_skills.map((skill, i) => (
                    <span key={i} className="skill-tag missing">{skill}</span>
                  ))}
                </div>
              ) : (
                <span className="detail-empty good">Covers all required skills</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CandidateDashboard() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [expandedId, setExpandedId] = useState(null);
  const [tierFilter, setTierFilter] = useState("all");
  const [sortBy, setSortBy] = useState("score");
  const [allCandidates, setAllCandidates] = useState([]);
  const [processingPipeline, setProcessingPipeline] = useState(false);
  const [pipelineMessage, setPipelineMessage] = useState("");

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = async () => {
  setLoading(true);
  setError("");
  try {
    const [jobData, candidatesData, allCandidatesData] = await Promise.all([
      getJobById(jobId),
      getRankedCandidates(jobId),
      getAllCandidatesForJob(jobId),
    ]);
    setJob(jobData);
    setCandidates(candidatesData);
    setAllCandidates(allCandidatesData);
  } catch (err) {
    setError("Could not load candidates. Try processing resumes first.");
  } finally {
    setLoading(false);
  }
};

const handleExtractSelected = async (candidateIds) => {
  setProcessingPipeline(true);
  setPipelineMessage(`Extracting ${candidateIds.length} candidate(s)...`);
  try {
    await extractSpecificCandidates(jobId, candidateIds);
    setPipelineMessage("Extraction complete.");
    await loadData();
  } catch (err) {
    setPipelineMessage("Extraction failed. Check quota or try again shortly.");
  } finally {
    setProcessingPipeline(false);
  }
};

const handleMatchSelected = async (candidateIds) => {
  setProcessingPipeline(true);
  setPipelineMessage(`Matching ${candidateIds.length} candidate(s)...`);
  try {
    await matchSpecificCandidates(jobId, candidateIds);
    setPipelineMessage("Matching complete.");
    await loadData();
  } catch (err) {
    setPipelineMessage("Matching failed. Check quota or try again shortly.");
  } finally {
    setProcessingPipeline(false);
  }
};

  const tierCounts = useMemo(() => {
    const counts = { high: 0, mid: 0, low: 0 };
    candidates.forEach((c) => counts[scoreTier(c.match_score)]++);
    return counts;
  }, [candidates]);

  const visibleCandidates = useMemo(() => {
    let list = [...candidates];
    if (tierFilter !== "all") {
      list = list.filter((c) => scoreTier(c.match_score) === tierFilter);
    }
    if (sortBy === "score") {
      list.sort((a, b) => b.match_score - a.match_score);
    } else if (sortBy === "name") {
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
    return list;
  }, [candidates, tierFilter, sortBy]);

  const total = candidates.length;

  return (
    <div className="dashboard-page">
      {job && (
        <div className="dashboard-job-header">
          <div className="job-header-main">
            <p className="eyebrow">Candidate shortlist</p>
            <h1>{job.title}</h1>
            <div className="job-header-meta">
              <span className="meta-pill">{job.location}</span>
              <span className="meta-pill">{job.work_mode}</span>
              <span className="meta-pill">{job.employment_type}</span>
              <span className="meta-pill muted">
                {job.min_experience}–{job.max_experience} yrs
              </span>
            </div>
          </div>
          <button className="btn-secondary" onClick={() => navigate(`/jobs/${jobId}/upload`)}>
            + Upload more resumes
          </button>
        </div>
      )}

      {loading && (
        <div className="dashboard-loading">
          <span className="pipeline-spinner" />
          <span>Loading candidates...</span>
        </div>
      )}

      {error && <p className="dashboard-error">{error}</p>}

      {!loading && !error && total === 0 && (
        <div className="empty-state">
          <span className="empty-icon">⌗</span>
          <h2>No candidates yet</h2>
          <p>Upload resumes for this role to get a ranked shortlist with scores and reasoning.</p>
          <button className="btn-primary btn-large" style={{ marginLeft: "110px" }} onClick={() => navigate(`/jobs/${jobId}/upload`)}>
            Upload resumes
          </button>
        </div>
      )}

      {!loading && !error && total > 0 && (
        <>
          <div className="distribution-card">
            <div className="distribution-header">
              <span className="distribution-title">{total} ranked candidate{total !== 1 ? "s" : ""}</span>
              <span className="distribution-sub">
                {tierCounts.high} strong · {tierCounts.mid} moderate · {tierCounts.low} weak
              </span>
            </div>
            <div className="distribution-bar">
              {tierCounts.high > 0 && (
                <div
                  className="distribution-segment seg-high"
                  style={{ width: `${(tierCounts.high / total) * 100}%` }}
                />
              )}
              {tierCounts.mid > 0 && (
                <div
                  className="distribution-segment seg-mid"
                  style={{ width: `${(tierCounts.mid / total) * 100}%` }}
                />
              )}
              {tierCounts.low > 0 && (
                <div
                  className="distribution-segment seg-low"
                  style={{ width: `${(tierCounts.low / total) * 100}%` }}
                />
              )}
            </div>
          </div>
          <PipelineManager
            jobId={jobId}
            allCandidates={allCandidates}
            onExtract={handleExtractSelected}
            onMatch={handleMatchSelected}
            processing={processingPipeline}
          />

          {pipelineMessage && <p className="pipeline-manager-message">{pipelineMessage}</p>}

          <div className="dashboard-controls">
            <div className="tier-pills">
              <button
                className={`tier-pill ${tierFilter === "all" ? "active" : ""}`}
                onClick={() => setTierFilter("all")}
              >
                All ({total})
              </button>
              <button
                className={`tier-pill tier-high ${tierFilter === "high" ? "active" : ""}`}
                onClick={() => setTierFilter("high")}
              >
                Strong ({tierCounts.high})
              </button>
              <button
                className={`tier-pill tier-mid ${tierFilter === "mid" ? "active" : ""}`}
                onClick={() => setTierFilter("mid")}
              >
                Moderate ({tierCounts.mid})
              </button>
              <button
                className={`tier-pill tier-low ${tierFilter === "low" ? "active" : ""}`}
                onClick={() => setTierFilter("low")}
              >
                Weak ({tierCounts.low})
              </button>
            </div>

            <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="score">Sort by score</option>
              <option value="name">Sort by name</option>
            </select>
          </div>

          {visibleCandidates.length === 0 ? (
            <div className="empty-state small">
              <p>No candidates in this tier.</p>
            </div>
          ) : (
            <div className="candidate-list">
              {visibleCandidates.map((candidate, index) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  rank={index + 1}
                  expanded={expandedId === candidate.id}
                  onToggle={() => setExpandedId(expandedId === candidate.id ? null : candidate.id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CandidateDashboard;
