import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { uploadResumes, extractCandidates, matchCandidates } from "../api/candidates";
import { getJobById } from "../api/jobs";
import "./UploadResumes.css";

const PIPELINE_STEPS = [
  { key: "upload", label: "Upload" },
  { key: "extract", label: "Extract" },
  { key: "match", label: "Match" },
];

function UploadResumes() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [jobLoading, setJobLoading] = useState(true);

  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const [stepStatus, setStepStatus] = useState({
    upload: "pending",
    extract: "pending",
    match: "pending",
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [resultCount, setResultCount] = useState(0);

  useEffect(() => {
    loadJob();
  }, [jobId]);

  const loadJob = async () => {
    setJobLoading(true);
    try {
      const data = await getJobById(jobId);
      setJob(data);
    } catch (err) {
      setError("Could not load this job. It may not exist.");
    } finally {
      setJobLoading(false);
    }
  };

  const handleFileChange = (e) => {
    addFiles(Array.from(e.target.files));
  };

  const addFiles = (newFiles) => {
    const valid = newFiles.filter((f) =>
      f.name.toLowerCase().endsWith(".pdf") || f.name.toLowerCase().endsWith(".docx")
    );
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const deduped = valid.filter((f) => !existingNames.has(f.name));
      return [...prev, ...deduped];
    });
    setError("");
  };

  const removeFile = (name) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const resetPipeline = () => {
    setStepStatus({ upload: "pending", extract: "pending", match: "pending" });
    setStatusMessage("");
    setError("");
    setResultCount(0);
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      setError("Select at least one resume (PDF or DOCX) before processing.");
      return;
    }

    resetPipeline();
    setIsRunning(true);

    try {
      setStepStatus((s) => ({ ...s, upload: "active" }));
      setStatusMessage(`Uploading ${files.length} resume${files.length !== 1 ? "s" : ""}...`);
      const uploaded = await uploadResumes(jobId, files);
      setResultCount(uploaded.length);
      setStepStatus((s) => ({ ...s, upload: "done" }));

      setStepStatus((s) => ({ ...s, extract: "active" }));
      setStatusMessage(
        `Reading ${uploaded.length} resume${uploaded.length !== 1 ? "s" : ""} and extracting candidate profiles. This calls the AI model once per resume, so it can take a moment...`
      );
      await extractCandidates(jobId);
      setStepStatus((s) => ({ ...s, extract: "done" }));

      setStepStatus((s) => ({ ...s, match: "active" }));
      setStatusMessage(`Comparing each candidate against "${job?.title}" and scoring fit...`);
      await matchCandidates(jobId);
      setStepStatus((s) => ({ ...s, match: "done" }));

      setStatusMessage(`Done. Ranked ${uploaded.length} candidate${uploaded.length !== 1 ? "s" : ""} for this role.`);
      setFiles([]);

      setTimeout(() => {
        navigate(`/jobs/${jobId}/candidates`);
      }, 1100);
    } catch (err) {
      setError(
        "Something went wrong while processing. Some candidates may already be saved — you can retry, already-processed resumes won't be reprocessed."
      );
      setStepStatus((s) => {
        const next = { ...s };
        for (const key of Object.keys(next)) {
          if (next[key] === "active") next[key] = "failed";
        }
        return next;
      });
    } finally {
      setIsRunning(false);
    }
  };

  const formatExperience = () => {
    if (!job) return "";
    if (job.min_experience === job.max_experience) return `${job.min_experience} yrs`;
    return `${job.min_experience}–${job.max_experience} yrs`;
  };

  const formatSalary = () => {
    if (!job || (!job.salary_min && !job.salary_max)) return null;
    const fmt = (n) => `₹${(n / 100000).toFixed(1)}L`;
    if (job.salary_min && job.salary_max) return `${fmt(job.salary_min)} – ${fmt(job.salary_max)}`;
    if (job.salary_min) return `From ${fmt(job.salary_min)}`;
    return `Up to ${fmt(job.salary_max)}`;
  };

  const requiredSkillsList = job?.required_skills
    ? job.required_skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const preferredSkillsList = job?.preferred_skills
    ? job.preferred_skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="upload-page">
      <div className="upload-header">
        <p className="eyebrow">Step 2 of 2</p>
        <h1>Upload resumes</h1>
        <p className="upload-sub">
          Drop in candidate resumes for this role. HireMind will read each one, extract a
          structured profile, and score it against the requirements below.
        </p>
      </div>

      <div className="upload-layout">
        {/* LEFT COLUMN — upload + pipeline */}
        <div className="upload-main">
          <div
            className={`dropzone ${dragActive ? "drag-active" : ""} ${isRunning ? "disabled" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              type="file"
              id="resume-input"
              multiple
              accept=".pdf,.docx"
              onChange={handleFileChange}
              disabled={isRunning}
              className="dropzone-input"
            />
            <label htmlFor="resume-input" className="dropzone-label">
              <span className="dropzone-icon">↥</span>
              <span className="dropzone-title">Drag and drop resumes here</span>
              <span className="dropzone-or">or click to browse</span>
              <span className="dropzone-formats">PDF or DOCX · multiple files supported</span>
            </label>
          </div>

          {files.length > 0 && (
            <div className="file-list">
              <div className="file-list-header">
                <span>{files.length} file{files.length !== 1 ? "s" : ""} selected</span>
                {!isRunning && (
                  <button className="clear-all" onClick={() => setFiles([])}>
                    Clear all
                  </button>
                )}
              </div>
              {files.map((f) => (
                <div className="file-row" key={f.name}>
                  <span className="file-icon">▤</span>
                  <span className="file-name">{f.name}</span>
                  <span className="file-size">{(f.size / 1024).toFixed(0)} KB</span>
                  {!isRunning && (
                    <button className="file-remove" onClick={() => removeFile(f.name)} aria-label="Remove file">
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {error && <p className="upload-error">{error}</p>}

          <button
            className="btn-primary btn-large process-btn"
            onClick={handleProcess}
            disabled={isRunning || files.length === 0}
          >
            {isRunning
              ? "Processing..."
              : `Process ${files.length > 0 ? files.length : ""} resume${files.length !== 1 ? "s" : ""}`}
          </button>

          {/* PIPELINE TRACKER */}
          {(isRunning || stepStatus.match === "done" || statusMessage) && (
            <div className="pipeline">
              <div className="pipeline-steps">
                {PIPELINE_STEPS.map((step, i) => (
                  <div className="pipeline-step" key={step.key}>
                    <div className={`pipeline-dot status-${stepStatus[step.key]}`}>
                      {stepStatus[step.key] === "done" && "✓"}
                      {stepStatus[step.key] === "failed" && "!"}
                    </div>
                    <span className={`pipeline-label status-${stepStatus[step.key]}`}>{step.label}</span>
                    {i < PIPELINE_STEPS.length - 1 && (
                      <span className={`pipeline-connector ${stepStatus[step.key] === "done" ? "filled" : ""}`} />
                    )}
                  </div>
                ))}
              </div>

              {statusMessage && (
                <div className="pipeline-message">
                  {isRunning && <span className="pipeline-spinner" />}
                  <span>{statusMessage}</span>
                </div>
              )}
            </div>
          )}

          <div className="upload-tips">
            <h3>How this works</h3>
            <ul>
              <li>Each resume is read in full — not just scanned for keywords.</li>
              <li>Extraction and matching run as two separate AI steps, so a slow or failed call on one resume never affects the others.</li>
              <li>You can upload more resumes to this same job later — already-processed candidates won't be re-scored.</li>
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN — job summary */}
        <div className="upload-sidebar">
          {jobLoading ? (
            <div className="job-summary-card skeleton">
              <div className="skeleton-line short" />
              <div className="skeleton-line" />
              <div className="skeleton-line medium" />
            </div>
          ) : job ? (
            <div className="job-summary-card">
              <span className="job-summary-label">Hiring for</span>
              <h2 className="job-summary-title">{job.title}</h2>

              <div className="job-summary-meta">
                <span className="meta-pill">{job.location}</span>
                <span className="meta-pill">{job.work_mode}</span>
                <span className="meta-pill">{job.employment_type}</span>
              </div>

              <div className="job-summary-row">
                <span className="row-label">Experience</span>
                <span className="row-value">{formatExperience()}</span>
              </div>

              {job.openings && (
                <div className="job-summary-row">
                  <span className="row-label">Openings</span>
                  <span className="row-value">{job.openings}</span>
                </div>
              )}

              {formatSalary() && (
                <div className="job-summary-row">
                  <span className="row-label">Salary</span>
                  <span className="row-value">{formatSalary()}</span>
                </div>
              )}

              {job.application_deadline && (
                <div className="job-summary-row">
                  <span className="row-label">Deadline</span>
                  <span className="row-value">{job.application_deadline}</span>
                </div>
              )}

              <div className="job-summary-divider" />

              <span className="job-summary-label">Required skills</span>
              <div className="skill-chip-row">
                {requiredSkillsList.map((s) => (
                  <span className="skill-chip required-chip" key={s}>{s}</span>
                ))}
              </div>

              {preferredSkillsList.length > 0 && (
                <>
                  <span className="job-summary-label" style={{ marginTop: "0.9rem" }}>
                    Preferred skills
                  </span>
                  <div className="skill-chip-row">
                    {preferredSkillsList.map((s) => (
                      <span className="skill-chip preferred-chip" key={s}>{s}</span>
                    ))}
                  </div>
                </>
              )}

              {job.education_requirement && (
                <>
                  <div className="job-summary-divider" />
                  <div className="job-summary-row">
                    <span className="row-label">Education</span>
                    <span className="row-value">{job.education_requirement}</span>
                  </div>
                </>
              )}

              <button className="view-job-link" onClick={() => navigate(`/jobs/${jobId}/candidates`)}>
                View ranked candidates →
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default UploadResumes;
