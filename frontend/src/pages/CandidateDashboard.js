import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MatchScoreBadge from "../components/MatchScoreBadge";
import { getCandidateApplications, getRecommendedJobs } from "../services/api";
import "./RecruitmentPages.css";

const CandidateDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationLoading, setRecommendationLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [resumeText, setResumeText] = useState("");

  useEffect(() => {
    const loadMyApplications = async () => {
      try {
        const [appsRes, recommendationsRes] = await Promise.all([
          getCandidateApplications(),
          getRecommendedJobs().catch(() => ({ data: { recommendations: [] } })),
        ]);

        setApplications(appsRes.data.applications || []);
        setRecommendations(recommendationsRes.data.recommendations || []);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load your applications.");
      } finally {
        setLoading(false);
        setRecommendationLoading(false);
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
        <div className="recruit-actions" style={{ marginTop: 14 }}>
          <Link to="/jobs" className="recruit-btn primary">Browse Jobs</Link>
        </div>
      </section>

      <section className="recruit-shell recruit-kpis">
        <div className="kpi"><strong>{applications.length}</strong><span>Total Applications</span></div>
        <div className="kpi"><strong>{avgMatch}%</strong><span>Average Match Score</span></div>
        <div className="kpi"><strong>{applications.filter((a) => a.status === "pending").length}</strong><span>Pending Reviews</span></div>
      </section>

      <section className="recruit-shell recruit-grid" style={{ marginBottom: 18 }}>
        <article className="recruit-card">
          <h3>Resume Snapshot</h3>
          <p className="recruit-muted" style={{ marginBottom: 10 }}>Keep an updated PDF ready before you apply.</p>
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
      </section>

      <section className="recruit-shell recruit-card" style={{ marginBottom: 18 }}>
        <h3 style={{ marginBottom: 10 }}>Recommended Jobs For You</h3>
        {recommendationLoading && <p className="recruit-muted">Generating recommendations...</p>}
        {!recommendationLoading && recommendations.length === 0 && (
          <p className="recruit-muted">No recommendations yet. Apply with a detailed resume to improve matching.</p>
        )}
        {!recommendationLoading && recommendations.length > 0 && (
          <div className="recruit-grid">
            {recommendations.slice(0, 4).map((job) => (
              <article key={job._id} className="recruit-card">
                <h3>{job.title}</h3>
                <p className="recruit-muted" style={{ marginBottom: 8 }}>{job.company}</p>
                <div style={{ marginBottom: 10 }}>
                  <MatchScoreBadge score={job.matchScore || 0} />
                </div>
                <p className="recruit-muted" style={{ marginBottom: 10 }}>
                  Matched skills: {(job.matchedSkills || []).slice(0, 4).join(", ") || "None"}
                </p>
                <Link to={`/jobs/${job._id}`} className="recruit-btn primary">View Job</Link>
              </article>
            ))}
          </div>
        )}
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
                  <th>Applied On</th>
                  <th>Status</th>
                  <th>Match</th>
                  <th>AI Feedback</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td>{app.job?.title || "Role"}</td>
                    <td>{app.job?.company || "Company"}</td>
                    <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td>{app.status || "pending"}</td>
                    <td><MatchScoreBadge score={app.matchScore || 0} /></td>
                    <td>
                      <p style={{ marginBottom: 6 }}>{app.resumeFeedback?.summary || "Feedback pending"}</p>
                      {app.resumeFeedback?.missingSkills?.length > 0 && (
                        <p className="recruit-muted" style={{ fontSize: "0.8rem" }}>
                          Missing: {app.resumeFeedback.missingSkills.slice(0, 3).join(", ")}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
                {applications.length === 0 && (
                  <tr>
                    <td colSpan="6" className="recruit-muted">No applications yet.</td>
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
