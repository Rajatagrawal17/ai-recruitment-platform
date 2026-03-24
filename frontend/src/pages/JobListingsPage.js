import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJobs } from "../services/api";
import "./RecruitmentPages.css";

const JobListingsPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const res = await getJobs();
        setJobs(res.data.jobs || []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load jobs right now.");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  return (
    <main className="recruit-page">
      <section className="recruit-shell recruit-hero">
        <h1 className="recruit-title">Open Jobs</h1>
        <p className="recruit-subtitle">Discover active opportunities and apply in a few steps.</p>
      </section>

      <section className="recruit-shell">
        {loading && <div className="recruit-card">Loading jobs...</div>}
        {error && <div className="recruit-card">{error}</div>}

        {!loading && !error && (
          <div className="recruit-grid">
            {jobs.map((job) => (
              <article key={job._id} className="recruit-card">
                <h3>{job.title}</h3>
                <p className="recruit-muted" style={{ marginBottom: 10 }}>{job.company || "Company"}</p>
                <p className="recruit-muted" style={{ marginBottom: 14 }}>{job.description}</p>
                <div className="recruit-actions">
                  <button className="recruit-btn primary" onClick={() => navigate(`/jobs/${job._id}`)}>
                    View & Apply
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default JobListingsPage;
