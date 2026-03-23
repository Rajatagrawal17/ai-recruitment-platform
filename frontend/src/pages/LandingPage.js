import React from "react";
import { Link } from "react-router-dom";
import "./RecruitmentPages.css";

const LandingPage = () => {
  return (
    <main className="recruit-page">
      <section className="recruit-shell recruit-hero">
        <h1 className="recruit-title">AI Recruitment Platform for Faster, Better Hiring</h1>
        <p className="recruit-subtitle">
          Cognifit now helps recruiters post jobs, screen resumes, and rank candidates using AI-powered match scoring.
          Candidates can apply quickly and track application status from a personalized dashboard.
        </p>
        <div className="recruit-actions">
          <Link to="/jobs" className="recruit-btn primary">Browse Jobs</Link>
          <Link to="/register" className="recruit-btn secondary">Create Account</Link>
        </div>
      </section>

      <section className="recruit-shell recruit-grid">
        <article className="recruit-card">
          <h3>Smart Resume Screening</h3>
          <p className="recruit-muted">Extract skills and experience from resumes and compare them against job requirements.</p>
        </article>
        <article className="recruit-card">
          <h3>Role-Based Dashboards</h3>
          <p className="recruit-muted">Separate flows for candidates and recruiters to keep actions focused and secure.</p>
        </article>
        <article className="recruit-card">
          <h3>Hiring Insights</h3>
          <p className="recruit-muted">Track applicant pipelines, match percentages, and candidate rankings from one place.</p>
        </article>
      </section>
    </main>
  );
};

export default LandingPage;
