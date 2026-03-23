import React, { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import "./RecruitmentPages.css";

const initialForm = {
  title: "",
  company: "",
  description: "",
};

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadDashboard = async () => {
    try {
      const [jobsRes, appsRes] = await Promise.all([
        API.get("/jobs"),
        API.get("/applications/all"),
      ]);
      setJobs(jobsRes.data.jobs || []);
      setApplications(appsRes.data.applications || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Recruiter data could not be loaded. Make sure your role is recruiter/admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      await API.post("/jobs/create", form);
      setMessage("Job posted successfully.");
      setForm(initialForm);
      loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create job.");
    } finally {
      setSaving(false);
    }
  };

  const ranking = useMemo(() => {
    return [...applications].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)).slice(0, 8);
  }, [applications]);

  return (
    <main className="recruit-page">
      <section className="recruit-shell recruit-hero">
        <h1 className="recruit-title">Recruiter Dashboard</h1>
        <p className="recruit-subtitle">Publish jobs, review applicants, and prioritize top matches.</p>
      </section>

      <section className="recruit-shell recruit-kpis">
        <div className="kpi"><strong>{jobs.length}</strong><span>Total Jobs</span></div>
        <div className="kpi"><strong>{applications.length}</strong><span>Total Applicants</span></div>
        <div className="kpi"><strong>{ranking[0]?.matchScore || 0}%</strong><span>Top Match Score</span></div>
      </section>

      <section className="recruit-shell recruit-grid" style={{ marginBottom: 18 }}>
        <article className="recruit-card">
          <h3>Create Job Posting</h3>
          <form className="recruit-form" onSubmit={handleCreateJob}>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Job title" required />
            <input name="company" value={form.company} onChange={handleChange} placeholder="Company" required />
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Job description" required />
            <button className="recruit-btn primary" type="submit" disabled={saving}>
              {saving ? "Posting..." : "Post Job"}
            </button>
          </form>
          {message && <p style={{ marginTop: 10 }}>{message}</p>}
          {error && <p style={{ marginTop: 10 }}>{error}</p>}
        </article>

        <article className="recruit-card">
          <h3>Candidate Ranking</h3>
          <p className="recruit-muted" style={{ marginBottom: 10 }}>Top applicants sorted by match score.</p>
          {ranking.map((app) => (
            <div key={app._id} style={{ marginBottom: 8 }}>
              <strong>{app.fullName || app.candidate?.name || "Candidate"}</strong>
              <span className="recruit-muted"> - {app.matchScore || 0}%</span>
            </div>
          ))}
          {!ranking.length && <p className="recruit-muted">No applicants available.</p>}
        </article>
      </section>

      <section className="recruit-shell recruit-card">
        <h3 style={{ marginBottom: 10 }}>All Jobs</h3>
        {loading && <p className="recruit-muted">Loading recruiter data...</p>}
        {!loading && (
          <div className="recruit-table-wrap">
            <table className="recruit-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Posted</th>
                  <th>Applicants</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id}>
                    <td>{job.title}</td>
                    <td>{job.company}</td>
                    <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                    <td>{applications.filter((a) => a.job?._id === job._id).length}</td>
                  </tr>
                ))}
                {jobs.length === 0 && (
                  <tr>
                    <td colSpan="4" className="recruit-muted">No jobs posted yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default RecruiterDashboard;
