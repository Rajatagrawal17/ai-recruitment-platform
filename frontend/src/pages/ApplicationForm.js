import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MatchScoreBadge from "../components/MatchScoreBadge";
import ResumeUpload from "../components/ResumeUpload";
import { applyToJob } from "../services/api";
import "./RecruitmentPages.css";

const initialData = {
  fullName: "",
  email: "",
  phone: "",
  yearsExperience: 0,
  coverLetter: "",
};

const ApplicationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialData);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep = () => {
    if (step === 1) {
      return formData.fullName.trim() && formData.email.trim() && formData.phone.trim();
    }

    if (step === 2) {
      return Boolean(resumeFile);
    }

    return true;
  };

  const submitApplication = async () => {
    setLoading(true);
    setError("");

    try {
      const payload = new FormData();
      payload.append("jobId", id);
      payload.append("fullName", formData.fullName);
      payload.append("email", formData.email);
      payload.append("phone", formData.phone);
      payload.append("yearsExperience", formData.yearsExperience);
      payload.append("coverLetter", formData.coverLetter);
      payload.append("resume", resumeFile);

      const res = await applyToJob(payload);
      setResult(res.data.application || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit application.");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <main className="recruit-page">
        <section className="recruit-shell recruit-card">
          <h2>Application submitted successfully</h2>
          <p className="recruit-muted">Your profile has been scored by the matching engine.</p>
          <MatchScoreBadge score={result.matchScore || 0} />
          <div className="recruit-actions" style={{ marginTop: 16 }}>
            <button className="recruit-btn primary" onClick={() => navigate("/candidate/dashboard")}>Go to Dashboard</button>
            <Link className="recruit-btn secondary" to="/jobs">Browse More Jobs</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="recruit-page">
      <section className="recruit-shell recruit-card">
        <h1 style={{ marginTop: 0 }}>Apply to Job</h1>
        <p className="recruit-muted">Step {step} of 3</p>
        {error && <p>{error}</p>}

        {step === 1 && (
          <div className="recruit-form">
            <input name="fullName" value={formData.fullName} onChange={updateField} placeholder="Full Name" />
            <input name="email" type="email" value={formData.email} onChange={updateField} placeholder="Email" />
            <input name="phone" value={formData.phone} onChange={updateField} placeholder="Phone" />
            <input
              name="yearsExperience"
              type="number"
              min="0"
              value={formData.yearsExperience}
              onChange={updateField}
              placeholder="Years of experience"
            />
            <textarea name="coverLetter" value={formData.coverLetter} onChange={updateField} placeholder="Cover letter" />
          </div>
        )}

        {step === 2 && (
          <ResumeUpload file={resumeFile} onFileChange={setResumeFile} />
        )}

        {step === 3 && (
          <div>
            <p><strong>Full Name:</strong> {formData.fullName}</p>
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Phone:</strong> {formData.phone}</p>
            <p><strong>Experience:</strong> {formData.yearsExperience} years</p>
            <p><strong>Resume:</strong> {resumeFile?.name}</p>
          </div>
        )}

        <div className="recruit-actions" style={{ marginTop: 16 }}>
          {step > 1 && (
            <button className="recruit-btn secondary" type="button" onClick={() => setStep((prev) => prev - 1)}>
              Back
            </button>
          )}
          {step < 3 && (
            <button
              className="recruit-btn primary"
              type="button"
              onClick={() => {
                if (!validateStep()) {
                  setError("Please complete required fields before continuing.");
                  return;
                }
                setError("");
                setStep((prev) => prev + 1);
              }}
            >
              Next
            </button>
          )}
          {step === 3 && (
            <button className="recruit-btn primary" type="button" onClick={submitApplication} disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          )}
        </div>
      </section>
    </main>
  );
};

export default ApplicationForm;
