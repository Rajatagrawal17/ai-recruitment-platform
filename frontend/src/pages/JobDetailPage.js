import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getJobById } from "../services/api";
import "./RecruitmentPages.css";

const JobDetailPage = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadJob = async () => {
      try {
        const res = await getJobById(id);
        setJob(res.data.job || res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load job details.");
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id]);

  if (loading) {
    return <main className="recruit-page"><section className="recruit-shell recruit-card">Loading job details...</section></main>;
  }

  if (error || !job) {
    return <main className="recruit-page"><section className="recruit-shell recruit-card">{error || "Job not found."}</section></main>;
  }

  return (
    <main className="recruit-page">
      <section className="recruit-shell recruit-card">
        <h1 className="recruit-title" style={{ marginTop: 0 }}>{job.title}</h1>
        <p className="recruit-muted" style={{ marginBottom: 12 }}>{job.company} - {job.location}</p>
        <p className="recruit-muted" style={{ marginBottom: 8 }}>Type: {job.type || "full-time"}</p>
        <p className="recruit-muted" style={{ marginBottom: 16 }}>Salary: {job.salary || "Negotiable"}</p>
        <p style={{ whiteSpace: "pre-wrap" }}>{job.description}</p>
        {Array.isArray(job.skills) && job.skills.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <strong>Skills: </strong>
            {job.skills.join(", ")}
          </div>
        )}
        <div className="recruit-actions" style={{ marginTop: 20 }}>
          <Link to={`/jobs/${job._id}/apply`} className="recruit-btn primary">Apply Now</Link>
          <Link to="/jobs" className="recruit-btn secondary">Back to Jobs</Link>
        </div>
      </section>
    </main>
  );
};

export default JobDetailPage;
