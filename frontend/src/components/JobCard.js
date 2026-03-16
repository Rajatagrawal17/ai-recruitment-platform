import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import "./JobCard.css";

const JobCard = ({ job, isApplied = false, matchScore = null }) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [circleDashoffset, setCircleDashoffset] = useState(339);
  const svgRef = useRef(null);
  const isLoggedIn = !!localStorage.getItem("token");

  // AI Match Score animation on mount
  useEffect(() => {
    if (matchScore && svgRef.current) {
      const circumference = 2 * Math.PI * 54;
      const offset = circumference - (matchScore / 100) * circumference;
      const timer = setTimeout(() => setCircleDashoffset(offset), 100);
      return () => clearTimeout(timer);
    }
  }, [matchScore]);

  // Get color indicator for job type
  const getTypeColor = (type) => {
    const typeMap = {
      "full-time": { color: "#10b981", label: "Full-time", dot: "🟢" },
      "part-time": { color: "#f59e0b", label: "Part-time", dot: "🟡" },
      contract: { color: "#a855f7", label: "Contract", dot: "🟣" },
      temporary: { color: "#06b6d4", label: "Temporary", dot: "🔵" }
    };
    return typeMap[type?.toLowerCase()] || typeMap["full-time"];
  };

  // Get color for location/remote indicator
  const getLocationColor = () => {
    if (job.location?.toLowerCase().includes("remote")) {
      return { color: "#06b6d4", indicator: "remote" };
    }
    return { color: "#64748b", indicator: "on-site" };
  };

  // Get experience level color
  const getExperienceColor = () => {
    const level = job.experienceLevel?.toLowerCase();
    if (level?.includes("entry")) return "#4f46e5";
    if (level?.includes("mid")) return "#06b6d4";
    if (level?.includes("senior")) return "#f59e0b";
    return "#94a3b8";
  };

  // Format salary
  const formatSalary = (salary) => {
    if (typeof salary === "number") {
      return `$${salary.toLocaleString()}`;
    }
    if (Array.isArray(salary)) {
      return `$${salary[0]?.toLocaleString()} - $${salary[1]?.toLocaleString()}`;
    }
    return salary;
  };

  // Get company initials
  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const typeInfo = getTypeColor(job.type);
  const locationInfo = getLocationColor();
  const visibleSkills = (job.skills || []).slice(0, 3);
  const moreSkillsCount = (job.skills || []).length - 3;
  const postedDate = job.postedDate
    ? new Date(job.postedDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      })
    : "Recently";

  const handleCardClick = () => {
    navigate(`/jobs/${job._id}`);
  };

  const handleApplyClick = (e) => {
    e.stopPropagation();
    if (!isApplied) {
      navigate(`/apply/${job._id}`);
    }
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  return (
    <div
      className="job-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* AI Match Score - Top Right */}
      {isLoggedIn && matchScore !== null && (
        <div className="ai-match-score">
          <svg
            ref={svgRef}
            width="120"
            height="120"
            viewBox="0 0 120 120"
            style={{ transform: "rotate(-90deg)" }}
          >
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="rgba(79, 70, 229, 0.1)"
              strokeWidth="6"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth="6"
              strokeDasharray="339"
              strokeDashoffset={circleDashoffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
            />
            <defs>
              <linearGradient
                id="scoreGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="score-inner">
            <span className="score-number">{matchScore}%</span>
            <span className="score-label">AI Match</span>
          </div>
        </div>
      )}

      {/* Card Header */}
      <div className="card-header">
        {/* Company Logo */}
        <div className="company-logo">
          {job.logo ? (
            <img src={job.logo} alt={job.company} />
          ) : (
            <div className="logo-fallback">
              <span>{getInitials(job.company)}</span>
            </div>
          )}
        </div>

        {/* Title & Company */}
        <div className="header-content">
          <h3 className="job-title">{job.title}</h3>
          <p className="company-name">{job.company}</p>
        </div>

        {/* Bookmark Button */}
        <button
          className={`bookmark-btn ${isSaved ? "saved" : ""}`}
          onClick={handleSaveClick}
          title={isSaved ? "Remove bookmark" : "Bookmark job"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Pills Row */}
      <div className="pills-row">
        {/* Location Pill */}
        <div className="pill" style={{ "--dot-color": locationInfo.color }}>
          <span className="pill-dot" style={{ backgroundColor: locationInfo.color }} />
          <span className="pill-text">
            {job.location || "On-site"}
          </span>
        </div>

        {/* Job Type Pill */}
        <div className="pill" style={{ "--dot-color": typeInfo.color }}>
          <span
            className="pill-dot"
            style={{ backgroundColor: typeInfo.color }}
          />
          <span className="pill-text">{typeInfo.label}</span>
        </div>

        {/* Experience Pill */}
        {job.experienceLevel && (
          <div
            className="pill"
            style={{ "--dot-color": getExperienceColor() }}
          >
            <span
              className="pill-dot"
              style={{ backgroundColor: getExperienceColor() }}
            />
            <span className="pill-text">{job.experienceLevel}</span>
          </div>
        )}
      </div>

      {/* Salary */}
      {job.salary && (
        <div className="salary-section">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            style={{ flexShrink: 0 }}
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 6v12M9 9h6a2 2 0 0 1 0 4h-6v4h6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span className="salary-text">{formatSalary(job.salary)}</span>
        </div>
      )}

      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <div className="skills-section">
          <div className="skills-container">
            {visibleSkills.map((skill, idx) => (
              <span key={idx} className="skill-tag">
                {skill}
              </span>
            ))}
            {moreSkillsCount > 0 && (
              <span className="skill-overflow">+{moreSkillsCount} more</span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="card-footer">
        <span className="posted-date">{postedDate}</span>
        <button
          className={`apply-btn ${isApplied ? "applied" : ""}`}
          onClick={handleApplyClick}
          disabled={isApplied}
        >
          {isApplied ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 6L9 17l-5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Applied
            </>
          ) : (
            "Apply"
          )}
        </button>
      </div>
    </div>
  );
};

JobCard.propTypes = {
  job: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    company: PropTypes.string.isRequired,
    location: PropTypes.string,
    type: PropTypes.string,
    salary: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number), PropTypes.string]),
    skills: PropTypes.arrayOf(PropTypes.string),
    experienceLevel: PropTypes.string,
    logo: PropTypes.string,
    postedDate: PropTypes.string,
  }).isRequired,
  isApplied: PropTypes.bool,
  matchScore: PropTypes.number,
};

export default JobCard;
