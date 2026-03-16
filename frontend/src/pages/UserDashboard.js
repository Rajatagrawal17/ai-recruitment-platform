import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
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
    <div className="admin-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>👤 User Dashboard</h1>
        <button onClick={handleLogout} style={{ width: "auto", padding: "0.6rem 1.5rem", maxWidth: "150px" }}>
          🚪 Logout
        </button>
      </div>

      {user && (
        <div className="admin-section" style={{ marginBottom: "2rem" }}>
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
        </div>
      )}

      <div className="admin-section">
        <div style={{ marginBottom: "1.5rem", borderBottom: "2px solid #e1e8ed", paddingBottom: "1rem" }}>
          <button
            onClick={() => setActiveTab("applications")}
            style={{
              padding: "0.6rem 1.5rem",
              marginRight: "0.5rem",
              background: activeTab === "applications" ? "linear-gradient(135deg, #667eea, #764ba2)" : "#e1e8ed",
              color: activeTab === "applications" ? "white" : "#666",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "all 0.3s ease"
            }}
          >
            📨 My Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            style={{
              padding: "0.6rem 1.5rem",
              marginRight: "0.5rem",
              background: activeTab === "stats" ? "linear-gradient(135deg, #667eea, #764ba2)" : "#e1e8ed",
              color: activeTab === "stats" ? "white" : "#666",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "all 0.3s ease"
            }}
          >
            📊 Statistics
          </button>
          <button
            onClick={() => setActiveTab("achievements")}
            style={{
              padding: "0.6rem 1.5rem",
              background: activeTab === "achievements" ? "linear-gradient(135deg, #667eea, #764ba2)" : "#e1e8ed",
              color: activeTab === "achievements" ? "white" : "#666",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "all 0.3s ease"
            }}
          >
            🏅 Achievements
          </button>
        </div>

        {renderContent()}
      </div>
    </div>
  );

  function renderContent() {
    if (loading) {
      return (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div className="loading"></div>
          <p>Loading...</p>
        </div>
      );
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
            applications.map((app, index) => (
              <div key={app._id} className="job-card" style={{ animationDelay: `${index * 0.1}s` }}>
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
              </div>
            ))
          )}
        </div>
      );
    }

    if (activeTab === "stats") {
      return (
        <div>
          <h3 style={{ marginBottom: "1.5rem" }}>📊 Your Statistics</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div
              style={{
                background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))",
                padding: "1.5rem",
                borderRadius: "12px",
                textAlign: "center",
                border: "2px solid #667eea"
              }}
            >
              <p style={{ color: "#999", marginBottom: "0.5rem" }}>Total Applications</p>
              <h2 style={{ color: "#667eea", margin: "0" }}>{applications.length}</h2>
            </div>
            <div
              style={{
                background: "linear-gradient(135deg, rgba(40, 167, 69, 0.1), rgba(40, 167, 69, 0.1))",
                padding: "1.5rem",
                borderRadius: "12px",
                textAlign: "center",
                border: "2px solid #28a745"
              }}
            >
              <p style={{ color: "#999", marginBottom: "0.5rem" }}>Accepted</p>
              <h2 style={{ color: "#28a745", margin: "0" }}>
                {applications.filter((a) => a.status === "accepted").length}
              </h2>
            </div>
            <div
              style={{
                background: "linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(220, 53, 69, 0.1))",
                padding: "1.5rem",
                borderRadius: "12px",
                textAlign: "center",
                border: "2px solid #dc3545"
              }}
            >
              <p style={{ color: "#999", marginBottom: "0.5rem" }}>Pending</p>
              <h2 style={{ color: "#dc3545", margin: "0" }}>
                {applications.filter((a) => a.status === "pending").length}
              </h2>
            </div>
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
