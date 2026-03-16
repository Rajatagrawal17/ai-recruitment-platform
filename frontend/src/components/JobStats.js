import React, { useEffect, useState } from "react";
import API from "../services/api";

const JobStats = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    companies: 0,
    open: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get("/jobs");
      const jobs = res.data.jobs || [];
      
      setStats({
        totalJobs: jobs.length,
        companies: new Set(jobs.map(j => j.company)).size,
        open: jobs.length
      });
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"></div>;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "1.5rem",
        marginBottom: "2rem",
        animation: "slideUpContainer 0.6s ease-out"
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          color: "white",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
          textAlign: "center",
          transition: "transform 0.3s ease"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📊</div>
        <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>Total Jobs</div>
        <div style={{ fontSize: "2.5rem", fontWeight: "700" }}>{stats.totalJobs}</div>
      </div>

      <div
        style={{
          background: "linear-gradient(135deg, #f093fb, #f5576c)",
          color: "white",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 8px 25px rgba(245, 87, 108, 0.3)",
          textAlign: "center",
          transition: "transform 0.3s ease"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🏢</div>
        <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>Companies</div>
        <div style={{ fontSize: "2.5rem", fontWeight: "700" }}>{stats.companies}</div>
      </div>

      <div
        style={{
          background: "linear-gradient(135deg, #4facfe, #00f2fe)",
          color: "white",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 8px 25px rgba(79, 172, 254, 0.3)",
          textAlign: "center",
          transition: "transform 0.3s ease"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>💼</div>
        <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>Open Positions</div>
        <div style={{ fontSize: "2.5rem", fontWeight: "700" }}>{stats.open}</div>
      </div>
    </div>
  );
};

export default JobStats;
