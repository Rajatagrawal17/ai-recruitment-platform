import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, MapPin, Briefcase, Code } from "lucide-react";
import API from "../services/api";
import { FALLBACK_RECOMMENDED_JOBS } from "../data/fallbackData";
import "./PersonalizedJobs.css";

const PersonalizedJobs = ({ triggerRefresh }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    fetchPersonalizedJobs();
  }, [triggerRefresh]);

  const fetchPersonalizedJobs = async () => {
    setLoading(true);
    setError("");
    setIsDemo(false);
    try {
      const response = await API.get("/users/personalized-jobs");
      if (response.data.success) {
        const jobList = response.data.jobs || [];
        setJobs(jobList);
        setUserProfile(response.data.userProfile);
        
        // If no jobs but we have a message, it might be "upload resume first"
        if (jobList.length === 0 && response.data.message) {
          setError(response.data.message);
        }
      } else {
        setError(response.data.message || "");
        setJobs(FALLBACK_RECOMMENDED_JOBS);
        setIsDemo(true);
      }
    } catch (err) {
      console.error("❌ Personalized jobs error:", err.message);
      // Silently use fallback data instead of showing error
      setJobs(FALLBACK_RECOMMENDED_JOBS);
      setIsDemo(true);
      setError(""); // Don't show error, just use demo data
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        className="personalized-jobs-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Finding jobs matched to your profile...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="personalized-jobs-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="jobs-header">
        <motion.div
          className="header-content"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
        >
          <h2>
            <Zap size={28} className="lightning-icon" />
            Personalized for You
          </h2>
          <p>Jobs matched to your skills, location, and interests</p>
        </motion.div>
      </div>

      {userProfile && (
        <motion.div
          className="profile-summary"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {userProfile.fieldOfInterest?.length > 0 && (
            <div className="summary-item">
              <Briefcase size={18} />
              <div>
                <strong>Interests:</strong>
                <div className="summary-tags">
                  {userProfile.fieldOfInterest.map((field, idx) => (
                    <span key={idx} className="summary-tag">
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {userProfile.currentLocation && (
            <div className="summary-item">
              <MapPin size={18} />
              <div>
                <strong>Location:</strong>
                <span>{userProfile.currentLocation}</span>
              </div>
            </div>
          )}

          {userProfile.skills?.length > 0 && (
            <div className="summary-item">
              <Code size={18} />
              <div>
                <strong>Top Skills:</strong>
                <div className="summary-tags">
                  {userProfile.skills.slice(0, 5).map((skill, idx) => (
                    <span key={idx} className="summary-tag skill-summary-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {error && (
        <motion.div
          className="error-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          ⚠️ {error}
        </motion.div>
      )}

      <motion.div className="jobs-grid">
        <AnimatePresence>
          {jobs.length > 0 ? (
            jobs.map((job, idx) => (
              <motion.div
                key={job._id}
                className="job-card"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -5, boxShadow: "0 12px 24px rgba(0,0,0,0.15)" }}
              >
                <div className="job-header">
                  <h3>{job.title}</h3>
                  {job.type && (
                    <span className={`job-type ${job.type.toLowerCase()}`}>
                      {job.type}
                    </span>
                  )}
                </div>

                <p className="job-company">🏢 {job.company}</p>

                {job.location && (
                  <div className="job-detail">
                    <MapPin size={16} />
                    <span>{job.location}</span>
                  </div>
                )}

                {job.salary && (
                  <div className="job-detail">
                    <span>💰 </span>
                    <span>{job.salary}</span>
                  </div>
                )}

                {job.skills && job.skills.length > 0 && (
                  <div className="job-skills">
                    <strong>Required Skills:</strong>
                    <div className="skill-tags">
                      {job.skills.slice(0, 4).map((skill, idx) => (
                        <span key={idx} className="skill-badge">
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 4 && (
                        <span className="skill-badge more">
                          +{job.skills.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {job.description && (
                  <p className="job-description">
                    {job.description.substring(0, 150)}...
                  </p>
                )}

                <motion.button
                  className="apply-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    window.location.href = `/jobs/${job._id}`;
                  }}
                >
                  View Details
                </motion.button>
              </motion.div>
            ))
          ) : (
            <motion.div
              className="no-jobs-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p>
                Complete your profile with LinkedIn URL and resume upload to see
                personalized job recommendations.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default PersonalizedJobs;
