import React, { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import "./RecruitmentPages.css";

const CandidateDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [resumeText, setResumeText] = useState("");

  useEffect(() => {
    const loadMyApplications = async () => {
      try {
        const res = await API.get("/applications/my");
        setApplications(res.data.applications || []);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load your applications.");
      } finally {
        setLoading(false);
      }
    };

    loadMyApplications();
  }, []);

  const avgMatch = useMemo(() => {
    if (!applications.length) return 0;
    const total = applications.reduce((sum, app) => sum + (app.matchScore || 0), 0);
    return Math.round(total / applications.length);
  }, [applications]);

  return (
    <main className="recruit-page">
      <section className="recruit-shell recruit-hero">
        <h1 className="recruit-title">Candidate Dashboard</h1>
        <p className="recruit-subtitle">Track applications, monitor match scores, and keep your resume ready.</p>
      </section>

      <section className="recruit-shell recruit-kpis">
        <div className="kpi"><strong>{applications.length}</strong><span>Total Applications</span></div>
        <div className="kpi"><strong>{avgMatch}%</strong><span>Average Match Score</span></div>
        <div className="kpi"><strong>{applications.filter((a) => a.status === "pending").length}</strong><span>Pending Reviews</span></div>
      </section>

      <section className="recruit-shell recruit-grid" style={{ marginBottom: 18 }}>
        <article className="recruit-card">
          <h3>Upload Resume</h3>
          <p className="recruit-muted" style={{ marginBottom: 10 }}>PDF/DOCX upload UI is ready. Backend parsing connection can be plugged in next.</p>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResumeFileName(e.target.files?.[0]?.name || "")}
          />
          {resumeFileName && <p className="recruit-muted" style={{ marginTop: 8 }}>Selected: {resumeFileName}</p>}
          <textarea
            placeholder="Paste resume text for quick AI preview..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            style={{ marginTop: 12 }}
          />
        </article>

        <article className="recruit-card">
          <h3>Profile Type</h3>
          <span className="role-badge candidate">Candidate</span>
          <p className="recruit-muted" style={{ marginTop: 10 }}>
            Use the Jobs page to apply. Match scores appear automatically after each application.
          </p>
        </article>
      </section>

      <section className="recruit-shell recruit-card">
        <h3 style={{ marginBottom: 10 }}>Applied Jobs</h3>
        {loading && <p className="recruit-muted">Loading applications...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && (
          <div className="recruit-table-wrap">
            <table className="recruit-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Match</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td>{app.job?.title || "Role"}</td>
                    <td>{app.job?.company || "Company"}</td>
                    <td>{app.status || "pending"}</td>
                    <td>{app.matchScore || 0}%</td>
                  </tr>
                ))}
                {applications.length === 0 && (
                  <tr>
                    <td colSpan="4" className="recruit-muted">No applications yet.</td>
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

export default CandidateDashboard;
