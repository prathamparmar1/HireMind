import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createJob } from "../api/jobs";
import TagInput from "../components/TagInput";
import "./CreateJob.css";

const WORK_MODES = ["Remote", "Hybrid", "Onsite"];
const EMPLOYMENT_TYPES = ["Full-Time", "Internship", "Contract"];
const EDUCATION_OPTIONS = [
  "No specific requirement",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
];

function CreateJob() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    location: "",
    work_mode: "Hybrid",
    employment_type: "Full-Time",
    min_experience: 0,
    max_experience: 3,
    required_skills: [],
    preferred_skills: [],
    education_requirement: "",
    salary_min: "",
    salary_max: "",
    openings: "",
    description: "",
    application_deadline: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleExperienceChange = (which, value) => {
    const num = Number(value);
    setForm((prev) => {
      const next = { ...prev, [which]: num };
      if (which === "min_experience" && num > prev.max_experience) {
        next.max_experience = num;
      }
      if (which === "max_experience" && num < prev.min_experience) {
        next.min_experience = num;
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const missing = [];
    if (!form.title.trim()) missing.push("Job Title");
    if (!form.location.trim()) missing.push("Location");
    if (!form.work_mode) missing.push("Work Mode");
    if (!form.employment_type) missing.push("Employment Type");
    if (form.required_skills.length === 0) missing.push("Required Skills");

    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        location: form.location.trim(),
        work_mode: form.work_mode,
        employment_type: form.employment_type,
        min_experience: form.min_experience,
        max_experience: form.max_experience,
        required_skills: form.required_skills.join(", "),
        preferred_skills: form.preferred_skills.length > 0 ? form.preferred_skills.join(", ") : null,
        education_requirement: form.education_requirement || null,
        salary_min: form.salary_min ? Number(form.salary_min) : null,
        salary_max: form.salary_max ? Number(form.salary_max) : null,
        openings: form.openings ? Number(form.openings) : null,
        description: form.description.trim() || null,
        application_deadline: form.application_deadline || null,
      };

      const newJob = await createJob(payload);
      navigate(`/jobs/${newJob.id}/upload`);
    } catch (err) {
      setError("Something went wrong while creating the job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-job-page">
      <div className="create-job-header">
        <p className="eyebrow">New role</p>
        <h1>Create a job posting</h1>
        <p className="create-job-sub">
          Define the role once. HireMind will use this to score and rank every candidate you upload.
        </p>
      </div>

      <form className="create-job-form" onSubmit={handleSubmit}>
        {/* Core details */}
        <div className="form-section">
          <h2 className="form-section-title">Core details</h2>

          <div className="form-grid two-col">
            <div className="form-field">
              <label>Job Title <span className="required">*</span></label>
              <input
                type="text"
                placeholder="e.g. Backend Engineer"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Location <span className="required">*</span></label>
              <input
                type="text"
                placeholder="e.g. Bangalore, India"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Work Mode <span className="required">*</span></label>
              <select value={form.work_mode} onChange={(e) => update("work_mode", e.target.value)}>
                {WORK_MODES.map((mode) => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Employment Type <span className="required">*</span></label>
              <select value={form.employment_type} onChange={(e) => update("employment_type", e.target.value)}>
                {EMPLOYMENT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Experience */}
        <div className="form-section">
          <h2 className="form-section-title">Experience required <span className="required">*</span></h2>

          <div className="experience-range">
            <div className="experience-display">
              <span className="experience-value">{form.min_experience}</span>
              <span className="experience-dash">–</span>
              <span className="experience-value">{form.max_experience}</span>
              <span className="experience-unit">years</span>
            </div>

            <div className="experience-sliders">
              <div className="slider-row">
                <label className="slider-label">Min</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={form.min_experience}
                  onChange={(e) => handleExperienceChange("min_experience", e.target.value)}
                />
              </div>
              <div className="slider-row">
                <label className="slider-label">Max</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={form.max_experience}
                  onChange={(e) => handleExperienceChange("max_experience", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="form-section">
          <h2 className="form-section-title">Skills</h2>

          <div className="form-field">
            <label>Required Skills <span className="required">*</span></label>
            <TagInput
              tags={form.required_skills}
              onChange={(tags) => update("required_skills", tags)}
              placeholder="Type a skill and press Enter — e.g. Python"
            />
          </div>

          <div className="form-field">
            <label>Preferred Skills <span className="optional">(optional)</span></label>
            <TagInput
              tags={form.preferred_skills}
              onChange={(tags) => update("preferred_skills", tags)}
              placeholder="Type a skill and press Enter — e.g. Docker"
            />
          </div>
        </div>

        {/* Additional details */}
        <div className="form-section">
          <h2 className="form-section-title">
            Additional details <span className="optional">(optional)</span>
          </h2>

          <div className="form-grid two-col">
            <div className="form-field">
              <label>Education Requirement</label>
              <select
                value={form.education_requirement}
                onChange={(e) => update("education_requirement", e.target.value)}
              >
                <option value="">Select an option</option>
                {EDUCATION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Number of Openings</label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 2"
                value={form.openings}
                onChange={(e) => update("openings", e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Salary Range (Min)</label>
              <input
                type="number"
                placeholder="e.g. 1200000"
                value={form.salary_min}
                onChange={(e) => update("salary_min", e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Salary Range (Max)</label>
              <input
                type="number"
                placeholder="e.g. 1800000"
                value={form.salary_max}
                onChange={(e) => update("salary_max", e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Application Deadline</label>
              <input
                type="date"
                value={form.application_deadline}
                onChange={(e) => update("application_deadline", e.target.value)}
              />
            </div>
          </div>

          <div className="form-field">
            <label>Job Description</label>
            <textarea
              rows={5}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="submit" className="btn-primary btn-large" disabled={loading}>
            {loading ? "Creating job..." : "Create job & continue"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateJob;
