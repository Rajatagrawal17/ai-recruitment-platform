import React, { useEffect, useMemo, useState } from "react";
import MatchScoreBadge from "../components/MatchScoreBadge";
import {
  createJob,
  getJobs,
  getJobCandidates,
  updateApplicationStatus,
} from "../services/api";
import "./RecruitmentPages.css";

const initialForm = {
  title: "",
  company: "",
  description: "",
  location: "",
  type: "full-time",
  salary: "",
  skills: "",
};

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [jobCandidates, setJobCandidates] = useState({});
  const [expandedJobId, setExpandedJobId] = useState("");
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadDashboard = async () => {
    try {
      const jobsRes = await getJobs();
      setJobs(jobsRes.data.jobs || []);
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
      await createJob({
        ...form,
        skills: form.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      });
      setMessage("Job posted successfully.");
      setForm(initialForm);
      loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create job.");
    } finally {
      setSaving(false);
    }
  };

  const handleExpandJob = async (jobId) => {
    if (expandedJobId === jobId) {
      setExpandedJobId("");
      return;
    }

    setExpandedJobId(jobId);

    if (jobCandidates[jobId]) {
      return;
    }

    setLoadingCandidates(true);
    try {
      const res = await getJobCandidates(jobId);
      setJobCandidates((prev) => ({
        ...prev,
        [jobId]: res.data.matchedCandidates || [],
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load candidates for this job.");
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleStatusChange = async (applicationId, status, jobId) => {
    try {
      await updateApplicationStatus(applicationId, status);
      const res = await getJobCandidates(jobId);
      setJobCandidates((prev) => ({
        ...prev,
        [jobId]: res.data.matchedCandidates || [],
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update application status.");
    }
  };

  const ranking = useMemo(() => {
    const merged = Object.values(jobCandidates).flat();
    return [...merged].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)).slice(0, 8);
  }, [jobCandidates]);

  return (
    <main className="recruit-page">
      <section className="recruit-shell recruit-hero">
        <h1 className="recruit-title">Recruiter Dashboard</h1>
        <p className="recruit-subtitle">Publish jobs, review applicants, and prioritize top matches.</p>
      </section>

      <section className="recruit-shell recruit-kpis">
        <div className="kpi"><strong>{jobs.length}</strong><span>Total Jobs</span></div>
        <div className="kpi"><strong>{Object.values(jobCandidates).flat().length}</strong><span>Total Applicants Loaded</span></div>
        <div className="kpi"><strong>{ranking[0]?.matchScore || 0}%</strong><span>Top Match Score</span></div>
      </section>

      <section className="recruit-shell recruit-grid" style={{ marginBottom: 18 }}>
        <article className="recruit-card">
          <h3>Create Job Posting</h3>
          <form className="recruit-form" onSubmit={handleCreateJob}>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Job title" required />
            <input name="company" value={form.company} onChange={handleChange} placeholder="Company" required />
            <input name="location" value={form.location} onChange={handleChange} placeholder="Location" required />
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="full-time">full-time</option>
              <option value="part-time">part-time</option>
              <option value="remote">remote</option>
            </select>
            <input name="salary" value={form.salary} onChange={handleChange} placeholder="Salary range" required />
            <input
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="Skills (comma separated)"
              required
            />
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
              <strong>{app.candidateName || app.fullName || "Candidate"}</strong>
              <span className="recruit-muted"> - </span>
              <MatchScoreBadge score={app.matchScore || 0} />
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
                  <th>Candidates</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <React.Fragment key={job._id}>
                    <tr>
                      <td>{job.title}</td>
                      <td>{job.company}</td>
                      <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="recruit-btn secondary" onClick={() => handleExpandJob(job._id)}>
                          {expandedJobId === job._id ? "Hide" : "View Ranked Candidates"}
                        </button>
                      </td>
                    </tr>
                    {expandedJobId === job._id && (
                      <tr>
                        <td colSpan="4">
                          {loadingCandidates ? (
                            <p className="recruit-muted">Loading candidates...</p>
                          ) : (jobCandidates[job._id] || []).length === 0 ? (
                            <p className="recruit-muted">No applicants for this job yet.</p>
                          ) : (
                            <div style={{ display: "grid", gap: 10 }}>
                              {jobCandidates[job._id].map((candidate) => (
                                <div
                                  key={candidate._id}
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 12,
                                    alignItems: "center",
                                    border: "1px solid rgba(148, 163, 184, 0.25)",
                                    borderRadius: 8,
                                    padding: 10,
                                  }}
                                >
                                  <div>
                                    <strong>{candidate.candidateName}</strong>
                                    <p className="recruit-muted" style={{ margin: "4px 0" }}>{candidate.candidateEmail}</p>
                                    <MatchScoreBadge score={candidate.matchScore || 0} />
                                  </div>
                                  <select
                                    value={candidate.status || "pending"}
                                    onChange={(event) => handleStatusChange(candidate._id, event.target.value, job._id)}
                                  >
                                    <option value="pending">pending</option>
                                    <option value="accepted">accepted</option>
                                    <option value="rejected">rejected</option>
                                  </select>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
