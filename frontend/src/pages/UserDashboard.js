import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import AnimatedCard from "../components/AnimatedCard";
import AnimatedStats from "../components/AnimatedStats";
import LoadingAnimation from "../components/LoadingAnimation";
import StatsChart from "../components/StatsChart";
import Achievements from "../components/Achievements";

const UserDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("applications");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userRes = await API.get("/users/profile");
      setUser(userRes.data.user);

      const appRes = await API.get("/applications/my-applications");
      setApplications(appRes.data.applications || []);
    } catch (error) {
      setError("Failed to load dashboard");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <motion.div 
      className="admin-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>👤 User Dashboard</h1>
        <motion.button 
          onClick={handleLogout} 
          style={{ width: "auto", padding: "0.6rem 1.5rem", maxWidth: "150px" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🚪 Logout
        </motion.button>
      </div>

      {user && (
        <motion.div 
          className="admin-section" 
          style={{ marginBottom: "2rem" }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3>📋 Profile Information</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <p style={{ color: "#999", fontSize: "0.9rem" }}>Name</p>
              <p style={{ fontSize: "1.1rem", fontWeight: "600", color: "#2c3e50" }}>{user.name}</p>
            </div>
            <div>
              <p style={{ color: "#999", fontSize: "0.9rem" }}>Email</p>
              <p style={{ fontSize: "1.1rem", fontWeight: "600", color: "#2c3e50" }}>{user.email}</p>
            </div>
            <div>
              <p style={{ color: "#999", fontSize: "0.9rem" }}>Role</p>
              <p style={{ fontSize: "1.1rem", fontWeight: "600", color: "#667eea" }}>
                {user.role === "admin" ? "🔐 Admin" : "👥 User"}
              </p>
            </div>
            <div>
              <p style={{ color: "#999", fontSize: "0.9rem" }}>Member Since</p>
              <p style={{ fontSize: "1.1rem", fontWeight: "600", color: "#2c3e50" }}>
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div 
        className="admin-section"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div style={{ marginBottom: "1.5rem", borderBottom: "2px solid #e1e8ed", paddingBottom: "1rem" }}>
          <motion.button
            onClick={() => setActiveTab("applications")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: "0.6rem 1.5rem",
              marginRight: "0.5rem",
              background: activeTab === "applications" ? "linear-gradient(135deg, #667eea, #764ba2)" : "#e1e8ed",
              color: activeTab === "applications" ? "white" : "#666",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "background 0.3s ease, color 0.3s ease"
            }}
          >
            📨 My Applications ({applications.length})
          </motion.button>
          <motion.button
            onClick={() => setActiveTab("stats")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: "0.6rem 1.5rem",
              marginRight: "0.5rem",
              background: activeTab === "stats" ? "linear-gradient(135deg, #667eea, #764ba2)" : "#e1e8ed",
              color: activeTab === "stats" ? "white" : "#666",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "background 0.3s ease, color 0.3s ease"
            }}
          >
            📊 Statistics
          </motion.button>
          <motion.button
            onClick={() => setActiveTab("achievements")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: "0.6rem 1.5rem",
              background: activeTab === "achievements" ? "linear-gradient(135deg, #667eea, #764ba2)" : "#e1e8ed",
              color: activeTab === "achievements" ? "white" : "#666",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "background 0.3s ease, color 0.3s ease"
            }}
          >
            🏅 Achievements
          </motion.button>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </motion.div>
    </motion.div>
  );

  function renderContent() {
    if (loading) {
      return <LoadingAnimation fullScreen={false} />;
    }

    if (activeTab === "applications") {
      return (
        <div>
          <h3 style={{ marginBottom: "1.5rem" }}>📨 My Applications</h3>
          {error && <div className="message error">{error}</div>}
          {applications.length === 0 ? (
            <p style={{ textAlign: "center", color: "#999", padding: "2rem" }}>
              No applications yet. Start applying to jobs!
            </p>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              <AnimatePresence>
                {applications.map((app, index) => (
                  <motion.div 
                    key={app._id} 
                    className="job-card" 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                  >
                    <h3>{app.jobId?.title || "Job"}</h3>
                    <p className="job-company">🏭 {app.jobId?.company || "Company"}</p>
                    <p style={{ color: "#666", marginBottom: "0.5rem" }}>
                      <strong>Status:</strong>
                    </p>
                    <div
                      style={{
                        display: "inline-block",
                        padding: "0.4rem 1rem",
                        borderRadius: "20px",
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        background:
                          app.status === "accepted"
                            ? "#d4edda"
                            : app.status === "rejected"
                            ? "#f8d7da"
                            : "#fff3cd",
                        color:
                          app.status === "accepted"
                            ? "#155724"
                            : app.status === "rejected"
                            ? "#721c24"
                            : "#856404",
                        marginBottom: "1rem"
                      }}
                    >
                      {app.status === "accepted"
                        ? "✅ Accepted"
                        : app.status === "rejected"
                        ? "❌ Rejected"
                        : "⏳ Pending"}
                    </div>
                    {app.matchScore && (
                      <p style={{ color: "#667eea", fontWeight: "600" }}>
                        🎯 Match Score: {app.matchScore}%
                      </p>
                    )}
                    <p style={{ color: "#999", fontSize: "0.9rem", marginTop: "1rem" }}>
                      Applied on {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === "stats") {
      return (
        <div>
          <h3 style={{ marginBottom: "1.5rem" }}>📊 Your Statistics</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <AnimatedStats
              icon="📨"
              label="Total Applications"
              value={applications.length}
              delay={0}
            />
            <AnimatedStats
              icon="✅"
              label="Accepted"
              value={applications.filter((a) => a.status === "accepted").length}
              delay={1}
            />
            <AnimatedStats
              icon="⏳"
              label="Pending"
              value={applications.filter((a) => a.status === "pending").length}
              delay={2}
            />
          </div>
        </div>
      );
    }

    if (activeTab === "achievements") {
      return (
        <Achievements
          applications={applications}
          accepted={applications.filter((a) => a.status === "accepted").length}
        />
      );
    }

    return null;
  }
};

export default UserDashboard;
