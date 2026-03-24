import React from "react";
import { Link } from "react-router-dom";
import "./RecruitmentPages.css";

const LandingPage = () => {
  return (
    <main className="recruit-page">
      <section className="recruit-shell recruit-hero">
        <div className="hero-kicker">AI Recruitment Platform</div>
        <h1 className="recruit-title">Find the right talent. Find the right job.</h1>
        <p className="recruit-subtitle">
          HireAI helps recruiters post jobs, screen resumes, and rank candidates with AI match scoring.
          Candidates can apply instantly, track application status, and view their match scores in one dashboard.
        </p>
        <div className="hero-stat-strip">
          <span>Real-time Candidate Ranking</span>
          <span>Role-Based Dashboards</span>
          <span>Faster Hiring Decisions</span>
        </div>
        <div className="recruit-actions">
          <Link to="/register?role=candidate" className="recruit-btn primary">I'm a Candidate</Link>
          <Link to="/register?role=recruiter" className="recruit-btn secondary">I'm a Recruiter</Link>
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

      <section className="recruit-shell feature-band">
        <article className="feature-panel">
          <p className="feature-label">Recruiter Experience</p>
          <h3>Prioritize candidates by skill fit and readiness</h3>
          <p className="recruit-muted">Surface high-potential applicants instantly with transparent match scoring and streamlined status management.</p>
        </article>
        <article className="feature-panel">
          <p className="feature-label">Candidate Experience</p>
          <h3>Apply faster with clarity on your score</h3>
          <p className="recruit-muted">Candidates can track applications, review match quality, and focus on roles aligned with their profile.</p>
        </article>
      </section>
    </main>
  );
};

export default LandingPage;
