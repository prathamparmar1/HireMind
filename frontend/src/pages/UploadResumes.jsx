import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { uploadResumes, extractCandidates, matchCandidates } from "../api/candidates";

function UploadResumes() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("idle"); // idle, uploading, extracting, matching, done, error
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const statusMessages = {
    idle: "",
    uploading: "Uploading resumes...",
    extracting: "Reading resumes and extracting candidate profiles...",
    matching: "Comparing candidates against job requirements...",
    done: "Done! Redirecting to results...",
    error: "Something went wrong.",
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      setError("Please select at least one resume file.");
      return;
    }

    setError("");

    try {
      setStatus("uploading");
      await uploadResumes(jobId, files);
      console.log("uploading comleted");

      setStatus("extracting");
      await extractCandidates(jobId);
      console.log("Extraction done")

      setStatus("matching");
      await matchCandidates(jobId);

      setStatus("done");
      setTimeout(() => {
        navigate(`/jobs/${jobId}/candidates`);
      }, 1000);
    } catch (err) {
      setStatus("error");
      setError("Processing failed. Please check your backend and try again.");
    }
  };

  const isProcessing = ["uploading", "extracting", "matching"].includes(status);

  return (
    <div className="page-container">
      <h1>Upload Resumes</h1>
      <p className="subtitle">Upload candidate resumes (PDF or DOCX). We'll handle the rest.</p>

      <div className="upload-box">
        <input
          type="file"
          multiple
          accept=".pdf,.docx"
          onChange={handleFileChange}
          disabled={isProcessing}
        />

        {files.length > 0 && (
          <p className="file-count">{files.length} file(s) selected</p>
        )}
      </div>

      {error && <p className="error-text">{error}</p>}

      {isProcessing && (
        <div className="processing-status">
          <div className="spinner"></div>
          <p>{statusMessages[status]}</p>
        </div>
      )}

      {status === "done" && <p className="success-text">{statusMessages.done}</p>}

      <button onClick={handleProcess} disabled={isProcessing || files.length === 0}>
        {isProcessing ? "Processing..." : "Process Resumes"}
      </button>
    </div>
  );
}

export default UploadResumes;