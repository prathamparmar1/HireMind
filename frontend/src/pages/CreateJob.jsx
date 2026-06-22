import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createJob } from "../api/jobs";

function CreateJob() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    required_skills: "",
    location: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title || !formData.description || !formData.required_skills) {
      setError("Please fill in title, description, and required skills.");
      return;
    }

    setLoading(true);
    try {
      const newJob = await createJob(formData);
      navigate(`/jobs/${newJob.id}/upload`);
    } catch (err) {
      setError("Something went wrong while creating the job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>Create a Job Posting</h1>
      <p className="subtitle">Define the role, then upload resumes to get ranked candidates.</p>

      <form onSubmit={handleSubmit} className="job-form">
        <label>Job Title</label>
        <input
          type="text"
          name="title"
          placeholder="e.g. Backend Engineer"
          value={formData.title}
          onChange={handleChange}
        />

        <label>Job Description</label>
        <textarea
          name="description"
          placeholder="Describe the role, responsibilities, and what you're looking for..."
          rows={5}
          value={formData.description}
          onChange={handleChange}
        />

        <label>Required Skills</label>
        <input
          type="text"
          name="required_skills"
          placeholder="e.g. Python, Django, PostgreSQL, Docker"
          value={formData.required_skills}
          onChange={handleChange}
        />

        <label>Location (optional)</label>
        <input
          type="text"
          name="location"
          placeholder="e.g. Bangalore"
          value={formData.location}
          onChange={handleChange}
        />

        {error && <p className="error-text">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Job & Continue"}
        </button>
      </form>
    </div>
  );
}

export default CreateJob;