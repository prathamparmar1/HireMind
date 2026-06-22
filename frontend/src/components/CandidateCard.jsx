import { useState } from "react";

function CandidateCard({ candidate, rank }) {
  const [expanded, setExpanded] = useState(false);

  const skills = candidate.extracted_skills
    ? JSON.parse(candidate.extracted_skills)
    : [];

  const projects = candidate.extracted_projects
    ? JSON.parse(candidate.extracted_projects)
    : [];

  const matchReasons = candidate.match_reasons
    ? JSON.parse(candidate.match_reasons)
    : { reasons: [], missing_skills: [] };

  const getScoreColor = (score) => {
    if (score >= 80) return "score-high";
    if (score >= 60) return "score-medium";
    return "score-low";
  };

  return (
    <div className="candidate-card">
      <div className="candidate-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="candidate-rank">#{rank}</div>

        <div className="candidate-basic-info">
          <h3>{candidate.name || "Unnamed Candidate"}</h3>
          <p className="candidate-email">{candidate.email || "No email extracted"}</p>
        </div>

        <div className={`candidate-score ${getScoreColor(candidate.match_score)}`}>
          {candidate.match_score}%
        </div>

        <button className="expand-toggle">{expanded ? "▲" : "▼"}</button>
      </div>

      {expanded && (
        <div className="candidate-card-details">
          <div className="detail-section">
            <h4>Skills</h4>
            <div className="skill-tags">
              {skills.map((skill, i) => (
                <span key={i} className="skill-tag">{skill}</span>
              ))}
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

          <div className="detail-section">
            <h4>Projects</h4>
            <ul>
              {projects.map((project, i) => (
                <li key={i}>{project}</li>
              ))}
            </ul>
          </div>

          <div className="detail-section">
            <h4>Why This Score?</h4>
            <ul>
              {matchReasons.reasons.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          </div>

          {matchReasons.missing_skills.length > 0 && (
            <div className="detail-section">
              <h4>Missing Skills</h4>
              <div className="skill-tags missing">
                {matchReasons.missing_skills.map((skill, i) => (
                  <span key={i} className="skill-tag missing">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CandidateCard;    