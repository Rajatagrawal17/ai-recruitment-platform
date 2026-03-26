import React from "react";
import { motion } from "framer-motion";
import { Zap, MapPin, Briefcase, DollarSign, TrendingUp } from "lucide-react";
import "./PersonalizedJobCard.css";

const PersonalizedJobCard = ({ job, onApply }) => {
  // Determine score color based on match percentage
  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981"; // Green
    if (score >= 60) return "#f59e0b"; // Amber
    return "#ef4444"; // Red
  };

  const getScoreLabel = (score) => {
    if (score >= 85) return "Excellent Match";
    if (score >= 70) return "Great Match";
    if (score >= 50) return "Good Match";
    return "Potential Match";
  };

  return (
    <motion.div
      className="personalized-job-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.1)" }}
    >
      {/* Match Score Badge */}
      <motion.div
        className="match-score-badge"
        style={{ background: getScoreColor(job.matchScore) }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <TrendingUp size={16} />
        <div className="score-info">
          <div className="score-value">{job.matchScore}%</div>
          <div className="score-label">{getScoreLabel(job.matchScore)}</div>
        </div>
      </motion.div>

      {/* Job Header */}
      <div className="job-header">
        <div>
          <h3 className="job-title">{job.title}</h3>
          <p className="company-name">{job.company}</p>
        </div>
      </div>

      {/* Job Details */}
      <div className="job-details">
        <div className="detail-group">
          <MapPin size={16} />
          <span>
            {job.location === "Remote" || job.type === "remote"
              ? "Remote"
              : job.location}
          </span>
        </div>
        <div className="detail-group">
          <Briefcase size={16} />
          <span>{job.type}</span>
        </div>
        {job.salary && (
          <div className="detail-group">
            <DollarSign size={16} />
            <span>₹{job.salary}</span>
          </div>
        )}
      </div>

      {/* Skills Tags */}
      {job.skills && job.skills.length > 0 && (
        <div className="skills-section">
          <p className="section-label">Required Skills</p>
          <div className="skills-list">
            {job.skills.slice(0, 4).map((skill, idx) => (
              <span key={idx} className="skill-tag">
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="skill-tag more">+{job.skills.length - 4}</span>
            )}
          </div>
        </div>
      )}

      {/* Match Details */}
      <div className="match-details">
        <p className="section-label">Match Breakdown</p>
        <div className="match-bars">
          {job.matchDetails && (
            <>
              <div className="match-bar">
                <div className="bar-label">Skills</div>
                <div className="bar-container">
                  <motion.div
                    className="bar-fill"
                    style={{ width: `${Math.min(job.matchDetails.skillMatch, 100)}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(job.matchDetails.skillMatch, 100)}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </div>
                <div className="bar-value">{job.matchDetails.skillMatch}%</div>
              </div>
              <div className="match-bar">
                <div className="bar-label">Location</div>
                <div className="bar-container">
                  <motion.div
                    className="bar-fill location"
                    style={{ width: `${Math.min(job.matchDetails.locationMatch, 100)}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(job.matchDetails.locationMatch, 100)}%` }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  />
                </div>
                <div className="bar-value">{job.matchDetails.locationMatch}%</div>
              </div>
              <div className="match-bar">
                <div className="bar-label">Interest</div>
                <div className="bar-container">
                  <motion.div
                    className="bar-fill interest"
                    style={{ width: `${Math.min(job.matchDetails.interestMatch, 100)}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(job.matchDetails.interestMatch, 100)}%` }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  />
                </div>
                <div className="bar-value">{job.matchDetails.interestMatch}%</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      {job.description && (
        <p className="job-description">
          {job.description.substring(0, 150)}
          {job.description.length > 150 ? "..." : ""}
        </p>
      )}

      {/* Action Button */}
      <motion.button
        className="apply-btn"
        onClick={() => onApply(job._id)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Zap size={16} />
        Apply Now
      </motion.button>
    </motion.div>
  );
};

export default PersonalizedJobCard;
