import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Briefcase,
  AlertCircle,
  Loader,
  Download,
  ExternalLink,
} from "lucide-react";
import API from "../services/api";
import ProfileSetupCard from "../components/ProfileSetupCard";
import PersonalizedJobCard from "../components/PersonalizedJobCard";
import "./PersonalizedDashboard.css";

const PersonalizedDashboard = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [personalizedJobs, setPersonalizedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await API.get("/users/profile-info");
      setUserProfile(response.data.user);
      setProfileComplete(response.data.user?.resumeDataExtracted);

      // If profile is complete, fetch personalized jobs
      if (response.data.user?.resumeDataExtracted) {
        fetchPersonalizedJobs();
      }
    } catch (err) {
      setError("Failed to load profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalizedJobs = async () => {
    try {
      const response = await API.get("/users/personalized-jobs");
      setPersonalizedJobs(response.data.jobs || []);
    } catch (err) {
      console.error("Failed to fetch personalized jobs:", err);
    }
  };

  const handleProfileUpdate = () => {
    // Refresh profile and jobs after update
    setTimeout(() => {
      fetchUserProfile();
    }, 500);
  };

  const handleApplyJob = async (jobId) => {
    try {
      const response = await API.post("/applications/apply", {
        jobId: jobId,
      });

      if (response.data.success) {
        alert("Application submitted successfully!");
        // Could update local state here
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to apply for job");
    }
  };

  const downloadResume = () => {
    if (userProfile?.resumeUrl) {
      const resumePath = userProfile.resumeUrl;
      const link = document.createElement("a");
      link.href = `${process.env.REACT_APP_API_URL || "https://cognifit-backend.onrender.com/api"}${resumePath}`;
      link.download = true;
      link.click();
    }
  };

  if (loading) {
    return (
      <div className="personalized-dashboard loading-state">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader size={40} color="#6366f1" />
        </motion.div>
        <p>Loading your personalized dashboard...</p>
      </div>
    );
  }

  return (
    <div className="personalized-dashboard">
      <motion.div
        className="dashboard-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section */}
        <motion.div
          className="dashboard-header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="header-content">
            <h1>
              <Target className="header-icon" />
              Your Personalized Job Board
            </h1>
            <p>AI-powered job recommendations based on your resume and preferences</p>
          </div>
        </motion.div>

        {error && (
          <motion.div
            className="error-banner"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Profile Setup Section */}
        {!profileComplete ? (
          <motion.div
            className="profile-setup-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ProfileSetupCard onProfileUpdate={handleProfileUpdate} />
          </motion.div>
        ) : (
          <>
            {/* Profile Summary */}
            <motion.div
              className="profile-summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="summary-header">
                <h2>Your Profile</h2>
                <motion.button
                  className="edit-profile-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    // Could open profile edit modal
                    window.location.href = "/candidate-dashboard";
                  }}
                >
                  Edit Profile
                </motion.button>
              </div>

              <div className="summary-grid">
                {/* Resume Info */}
                <motion.div
                  className="summary-card resume-card"
                  whileHover={{ y: -4 }}
                >
                  <div className="card-header">
                    <Briefcase className="card-icon" />
                    <h3>Resume</h3>
                  </div>
                  <div className="card-content">
                    <p>✅ Resume uploaded and analyzed</p>
                    <motion.button
                      className="secondary-btn"
                      onClick={downloadResume}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Download size={16} />
                      Download Resume
                    </motion.button>
                  </div>
                </motion.div>

                {/* Skills Card */}
                {userProfile?.skills && userProfile.skills.length > 0 && (
                  <motion.div
                    className="summary-card"
                    whileHover={{ y: -4 }}
                  >
                    <div className="card-header">
                      <h3>Your Skills ({userProfile.skills.length})</h3>
                    </div>
                    <div className="card-content">
                      <div className="skills-preview">
                        {userProfile.skills.slice(0, 6).map((skill, idx) => (
                          <span key={idx} className="skill-badge">
                            {skill}
                          </span>
                        ))}
                        {userProfile.skills.length > 6 && (
                          <span className="skill-badge more">
                            +{userProfile.skills.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Interests Card */}
                {userProfile?.fieldOfInterest &&
                  userProfile.fieldOfInterest.length > 0 && (
                    <motion.div
                      className="summary-card"
                      whileHover={{ y: -4 }}
                    >
                      <div className="card-header">
                        <h3>
                          Interest Areas ({userProfile.fieldOfInterest.length})
                        </h3>
                      </div>
                      <div className="card-content">
                        <div className="interests-list">
                          {userProfile.fieldOfInterest.map((interest, idx) => (
                            <span key={idx} className="interest-badge">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                {/* Location Card */}
                {userProfile?.currentLocation && (
                  <motion.div
                    className="summary-card"
                    whileHover={{ y: -4 }}
                  >
                    <div className="card-header">
                      <h3>Preferred Location</h3>
                    </div>
                    <div className="card-content">
                      <p className="location-text">📍 {userProfile.currentLocation}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Personalized Jobs Section */}
            <motion.div
              className="jobs-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="jobs-header">
                <h2>
                  <Briefcase className="section-icon" />
                  Recommended Jobs ({personalizedJobs.length})
                </h2>
                <p className="jobs-subtitle">
                  These jobs match your profile, skills, and preferences
                </p>
              </div>

              {personalizedJobs.length === 0 ? (
                <motion.div
                  className="no-jobs-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <AlertCircle size={48} />
                  <h3>No matching jobs found</h3>
                  <p>
                    We're still looking for jobs that match your profile. Check back
                    soon!
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  className="jobs-grid"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1,
                      },
                    },
                  }}
                >
                  <AnimatePresence>
                    {personalizedJobs.map((job, index) => (
                      <motion.div
                        key={job._id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <PersonalizedJobCard
                          job={job}
                          onApply={handleApplyJob}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PersonalizedDashboard;
