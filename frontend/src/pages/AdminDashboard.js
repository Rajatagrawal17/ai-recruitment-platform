import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import AnimatedStats from "../components/AnimatedStats";
import AnimatedCard from "../components/AnimatedCard";
import StatsChart from "../components/StatsChart";
import LoadingAnimation from "../components/LoadingAnimation";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    totalCandidates: 0,
    openPositions: 0
  });
  const [jobs, setJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    location: "",
    type: "full-time",
    salary: 0,
    description: "",
    skills: []
  });
  const [showAddJob, setShowAddJob] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [jobsRes, statsRes] = await Promise.all([
        API.get("/jobs"),
        API.get("/dashboard/stats")
      ]);

      setJobs(jobsRes.data.jobs || []);
      setStats(statsRes.data || {
        totalJobs: jobsRes.data.jobs?.length || 0,
        totalApplications: 0,
        totalCandidates: 0,
        openPositions: jobsRes.data.jobs?.length || 0
      });

      // Mock recent applications
      setRecentApplications([
        {
          id: 1,
          candidateName: "Sarah Johnson",
          position: "Senior Developer",
          status: "pending",
          date: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: 2,
          candidateName: "Michael Chen",
          position: "Product Manager",
          status: "accepted",
          date: new Date(Date.now() - 5 * 60 * 60 * 1000)
        },
        {
          id: 3,
          candidateName: "Emma Davis",
          position: "UX Designer",
          status: "pending",
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          id: 4,
          candidateName: "Alex Kumar",
          position: "Data Scientist",
          status: "rejected",
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }
      ]);
    } catch (err) {
      setError("Failed to load dashboard");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    try {
      await API.post("/jobs", newJob);
      setShowAddJob(false);
      setNewJob({
        title: "",
        company: "",
        location: "",
        type: "full-time",
        salary: 0,
        description: "",
        skills: []
      });
      await fetchDashboardData();
    } catch (err) {
      console.error("Failed to add job:", err);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await API.delete(`/jobs/${jobId}`);
        await fetchDashboardData();
      } catch (err) {
        console.error("Failed to delete job:", err);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "accepted":
        return "status-accepted";
      case "rejected":
        return "status-rejected";
      default:
        return "status-pending";
    }
  };

  if (loading) {
    return <LoadingAnimation fullScreen={true} />;
  }

  return (
    <div className="admin-container">
      {/* Background Orbs */}
      <div className="background-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Header */}
      <div className="admin-header">
        <div className="header-content">
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">Manage jobs, candidates, and applications</p>
        </div>
        <motion.button
          className="btn btn-primary btn-add-job"
          onClick={() => setShowAddJob(!showAddJob)}
          whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(79, 70, 229, 0.3)" }}
          whileTap={{ scale: 0.95 }}
        >
          {showAddJob ? "Cancel" : "+ Add New Job"}
        </motion.button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Main Content */}
      <div className="admin-content">
        {/* Left Sidebar */}
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            <button
              className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Overview
            </button>
            <button
              className={`nav-item ${activeTab === "jobs" ? "active" : ""}`}
              onClick={() => setActiveTab("jobs")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
              Jobs
            </button>
            <button
              className={`nav-item ${activeTab === "applications" ? "active" : ""}`}
              onClick={() => setActiveTab("applications")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                <polyline points="13 2 13 9 20 9"></polyline>
              </svg>
              Applications
            </button>
          </nav>
        </aside>

        {/* Main Panel */}
        <main className="admin-main">
          {/* Stats Cards */}
          {activeTab === "overview" && (
            <div className="admin-overview">
              <div className="stats-grid">
                <AnimatedStats
                  icon="📋"
                  label="Total Jobs"
                  value={stats.totalJobs}
                  change={{ type: "up", value: 2, label: "this month" }}
                  delay={0}
                />
                <AnimatedStats
                  icon="📝"
                  label="Applications"
                  value={stats.totalApplications}
                  change={{ type: "up", value: 12, label: "this week" }}
                  delay={1}
                />
                <AnimatedStats
                  icon="👥"
                  label="Total Candidates"
                  value={stats.totalCandidates}
                  change={{ type: "up", value: 3, label: "hired" }}
                  delay={2}
                />
                <AnimatedStats
                  icon="🎯"
                  label="Open Positions"
                  value={stats.openPositions}
                  change={{ type: "up", value: Math.round((stats.openPositions / Math.max(stats.totalJobs, 1)) * 100), label: "% of total" }}
                  delay={3}
                />
              </div>

              {/* Charts Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                style={{ marginTop: "2rem" }}
              >
                <StatsChart
                  type="bar"
                  title="Applications Trend"
                  data={[
                    { name: "Week 1", value: 12 },
                    { name: "Week 2", value: 19 },
                    { name: "Week 3", value: 15 },
                    { name: "Week 4", value: 24 }
                  ]}
                  delay={4}
                />
              </motion.div>

              {/* Candidate Pipeline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="pipeline-section"
              >
                <h2>Candidate Pipeline</h2>
                <div className="pipeline-stages">
                  <div className="pipeline-stage">
                    <div className="stage-header">Applied</div>
                    <div className="stage-count">24</div>
                    <div className="stage-bar">
                      <div className="stage-progress" style={{ width: "100%" }}></div>
                    </div>
                  </div>
                  <div className="pipeline-stage">
                    <div className="stage-header">Screening</div>
                    <div className="stage-count">16</div>
                    <div className="stage-bar">
                      <div
                        className="stage-progress"
                        style={{
                          width: "66.7%",
                          background: "linear-gradient(90deg, #06b6d4, #0ea5e9)"
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="pipeline-stage">
                    <div className="stage-header">Interview</div>
                    <div className="stage-count">8</div>
                    <div className="stage-bar">
                      <div
                        className="stage-progress"
                        style={{
                          width: "33.3%",
                          background: "linear-gradient(90deg, #10b981, #34d399)"
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="pipeline-stage">
                    <div className="stage-header">Offer</div>
                    <div className="stage-count">3</div>
                    <div className="stage-bar">
                      <div
                        className="stage-progress"
                        style={{
                          width: "12.5%",
                          background: "linear-gradient(90deg, #f59e0b, #fbbf24)"
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="activity-section"
              >
                <h2>Recent Activity</h2>
                <div className="activity-list">
                  {recentApplications.map((app, index) => (
                    <AnimatedCard key={app.id} delay={index}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", width: "100%" }}>
                        <div className="activity-avatar">
                          {app.candidateName.charAt(0)}
                        </div>
                        <div className="activity-details" style={{ flex: 1 }}>
                          <div className="activity-name">{app.candidateName}</div>
                          <div className="activity-position">
                            Applied for {app.position}
                          </div>
                        </div>
                        <div className={`activity-status ${getStatusColor(app.status)}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </div>
                        <div className="activity-date">
                          {formatTimeAgo(app.date)}
                        </div>
                      </div>
                    </AnimatedCard>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* Jobs Tab */}
          {activeTab === "jobs" && (
            <div className="jobs-management">
              <h2>Job Listings</h2>
              <AnimatePresence>
              {showAddJob && (
                <motion.div 
                  className="add-job-form"
                  initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                  animate={{ opacity: 1, height: "auto", overflow: "visible" }}
                  exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <h3>Add New Job</h3>
                  <form onSubmit={handleAddJob}>
                    <div className="form-row">
                      <input
                        type="text"
                        placeholder="Job Title"
                        value={newJob.title}
                        onChange={(e) =>
                          setNewJob({ ...newJob, title: e.target.value })
                        }
                        required
                      />
                      <input
                        type="text"
                        placeholder="Company"
                        value={newJob.company}
                        onChange={(e) =>
                          setNewJob({ ...newJob, company: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="form-row">
                      <input
                        type="text"
                        placeholder="Location"
                        value={newJob.location}
                        onChange={(e) =>
                          setNewJob({ ...newJob, location: e.target.value })
                        }
                      />
                      <input
                        type="number"
                        placeholder="Salary"
                        value={newJob.salary}
                        onChange={(e) =>
                          setNewJob({ ...newJob, salary: parseInt(e.target.value) })
                        }
                      />
                    </div>
                    <textarea
                      placeholder="Job Description"
                      value={newJob.description}
                      onChange={(e) =>
                        setNewJob({ ...newJob, description: e.target.value })
                      }
                    ></textarea>
                    <button type="submit" className="btn btn-primary">
                      Create Job
                    </button>
                  </form>
                </motion.div>
              )}
              </AnimatePresence>

              <div className="jobs-table">
                <AnimatePresence>
                {jobs.length > 0 ? (
                  jobs.map((job, index) => (
                    <AnimatedCard 
                      key={job._id} 
                      delay={index} 
                      className="job-row-animated"
                      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                    >
                      <div className="job-info">
                        <div className="job-title">{job.title}</div>
                        <div className="job-company">{job.company}</div>
                      </div>
                      <div className="job-meta">
                        <span className="location">{job.location}</span>
                        <span className="type">{job.type}</span>
                      </div>
                      <div className="job-salary">
                        ${job.salary?.toLocaleString() || "N/A"}
                      </div>
                      <div className="job-actions">
                        <motion.button
                          className="btn-edit"
                          onClick={() => navigate(`/jobs/${job._id}`)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Edit
                        </motion.button>
                        <motion.button
                          className="btn-delete"
                          onClick={() => handleDeleteJob(job._id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Delete
                        </motion.button>
                      </div>
                    </AnimatedCard>
                  ))
                ) : (
                  <motion.div 
                    className="empty-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    No jobs found
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === "applications" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="applications-management"
            >
              <h2>Recent Applications</h2>
              <div className="applications-list">
                {recentApplications.map((app, index) => (
                  <AnimatedCard key={app.id} delay={index}>
                    <div className="app-header">
                      <div className="app-info">
                        <div className="app-name">{app.candidateName}</div>
                        <div className="app-position">{app.position}</div>
                      </div>
                      <div className={`app-status ${getStatusColor(app.status)}`}>
                        {app.status.toUpperCase()}
                      </div>
                    </div>
                    <div className="app-footer">
                      <span className="app-date">
                        {formatTimeAgo(app.date)}
                      </span>
                      <div className="app-actions">
                        <button className="btn-small">View</button>
                        <button className="btn-small">Message</button>
                      </div>
                    </div>
                  </AnimatedCard>
                ))}
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, label, value, trend, trendUp }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <div className={`stat-trend ${trendUp ? "up" : "down"}`}>
          {trendUp ? "↑" : "↓"} {trend}
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton
const AdminLoadingSkeleton = () => {
  return (
    <div className="admin-container">
      <div className="admin-header">
        <div style={{ height: "40px", width: "300px", background: "rgba(79, 70, 229, 0.2)", borderRadius: "8px" }}></div>
      </div>
      <div className="stats-grid">
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ height: "120px", background: "rgba(79, 70, 229, 0.1)", borderRadius: "12px" }}></div>
        ))}
      </div>
    </div>
  );
};

// Helper function
const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [name, secondsInInterval] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInInterval);
    if (interval >= 1) {
      return interval === 1
        ? `${interval} ${name} ago`
        : `${interval} ${name}s ago`;
    }
  }
  return "Just now";
};

export default AdminDashboard;