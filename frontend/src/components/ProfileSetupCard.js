import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Trash2, Link as LinkIcon, AlertCircle, CheckCircle } from "lucide-react";
import API from "../services/api";
import "./ProfileSetupCard.css";

const ProfileSetupCard = ({ onProfileUpdate }) => {
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await API.get("/users/profile-info");
      if (response.data.user) {
        setProfileData(response.data.user);
        setLinkedinUrl(response.data.user.linkedinUrl || "");
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  const handleLinkedinSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!linkedinUrl || !linkedinUrl.includes("linkedin.com")) {
      setError("Please enter a valid LinkedIn URL");
      return;
    }

    setLoading(true);
    try {
      const response = await API.put("/users/linkedin", { linkedinUrl });
      if (response.data.success) {
        setSuccess("LinkedIn profile linked successfully!");
        setProfileData(response.data.user);
        if (onProfileUpdate) onProfileUpdate();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update LinkedIn URL");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!resumeFile) {
      setError("Please select a resume file");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);

    setLoading(true);
    try {
      // IMPORTANT: Do NOT set Content-Type header manually for FormData!
      // Axios will automatically set it with the correct boundary
      // Manual header breaks multipart parsing on backend
      const response = await API.post("/users/resume/upload", formData);

      console.log("✅ Resume upload successful:", response.data);

      if (response.data.success) {
        setSuccess("Resume uploaded and processed successfully!");
        setResumeFile(null);
        setProfileData({
          ...profileData,
          ...response.data.data,
        });
        if (onProfileUpdate) onProfileUpdate();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.data.message || "Upload failed");
      }
    } catch (err) {
      console.error("❌ Resume upload error:", err.response?.data || err.message);
      setError(
        err.response?.data?.message || "Failed to upload resume"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm("Are you sure you want to delete your resume?")) return;

    setLoading(true);
    try {
      const response = await API.delete("/users/resume");
      if (response.data.success) {
        setSuccess("Resume deleted successfully");
        setProfileData({
          ...profileData,
          resumeUrl: null,
        });
        if (onProfileUpdate) onProfileUpdate();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="profile-setup-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="profile-header">
        <h2>🎯 Complete Your Profile</h2>
        <p>Link your LinkedIn and upload resume to get personalized job recommendations</p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            className="alert alert-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </motion.div>
        )}
        {success && (
          <motion.div
            className="alert alert-success"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <CheckCircle size={18} />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LinkedIn Section */}
      <motion.div
        className="profile-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h3>
          <LinkIcon size={20} />
          LinkedIn Profile
        </h3>
        <form onSubmit={handleLinkedinSubmit} className="profile-form">
          <input
            type="text"
            placeholder="https://linkedin.com/in/yourprofile"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            disabled={loading}
            required
          />
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? "Updating..." : "Link LinkedIn"}
          </motion.button>
        </form>
        {profileData?.linkedinUrl && (
          <motion.p
            className="profile-info-success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            ✅ LinkedIn profile linked
          </motion.p>
        )}
      </motion.div>

      {/* Resume Section */}
      <motion.div
        className="profile-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3>
          <Upload size={20} />
          Upload Resume
        </h3>
        <form onSubmit={handleResumeUpload} className="profile-form">
          <div className="file-input-wrapper">
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => setResumeFile(e.target.files[0])}
              disabled={loading}
              id="resume-input"
            />
            <label htmlFor="resume-input">
              {resumeFile ? (
                <>
                  <Upload size={18} />
                  <span>{resumeFile.name}</span>
                </>
              ) : (
                <>
                  <Upload size={18} />
                  <span>Choose PDF or DOCX file</span>
                </>
              )}
            </label>
          </div>
          <motion.button
            type="submit"
            disabled={loading || !resumeFile}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? "Uploading..." : "Upload Resume"}
          </motion.button>
        </form>

        {profileData?.resumeUrl && (
          <motion.div
            className="resume-info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="resume-status">✅ Resume uploaded and processed</p>

            {profileData?.fieldOfInterest && profileData.fieldOfInterest.length > 0 && (
              <div className="info-block">
                <strong>Fields of Interest:</strong>
                <div className="tag-list">
                  {profileData.fieldOfInterest.map((field, idx) => (
                    <span key={idx} className="tag">
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profileData?.skills && profileData.skills.length > 0 && (
              <div className="info-block">
                <strong>Detected Skills:</strong>
                <div className="tag-list">
                  {profileData.skills.slice(0, 8).map((skill, idx) => (
                    <span key={idx} className="tag skill-tag">
                      {skill}
                    </span>
                  ))}
                  {profileData.skills.length > 8 && (
                    <span className="tag more-tag">+{profileData.skills.length - 8} more</span>
                  )}
                </div>
              </div>
            )}

            {profileData?.currentLocation && (
              <div className="info-block">
                <strong>📍 Location:</strong>
                <span>{profileData.currentLocation}</span>
              </div>
            )}

            <motion.button
              type="button"
              onClick={handleDeleteResume}
              disabled={loading}
              className="delete-resume-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Trash2 size={16} />
              Delete Resume
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {profileData?.fieldOfInterest?.length > 0 && (
        <motion.div
          className="profile-completion-notice"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <CheckCircle size={20} className="check-icon" />
          <div>
            <strong>Profile Complete!</strong>
            <p>
              Check out your personalized job recommendations based on your profile.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProfileSetupCard;
