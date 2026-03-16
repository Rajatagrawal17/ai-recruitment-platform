import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { FAKE_JOBS } from "../data/fakeData";
import "./ApplyJob.css";

const ApplyJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const coverLetterRef = useRef(null);

  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showExpandedDesc, setShowExpandedDesc] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedinUrl: "",
    portfolioUrl: "",
    yearsExperience: 0,
    resumeFile: null,
    resumeFileName: "",
    resumeSize: 0,
    coverLetter: "",
    agreeTerms: false
  });

  const [errors, setErrors] = useState({});
  const [daysLeft] = useState(5);

  useEffect(() => {
    fetchJobDetails();
    loadUserData();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const res = await API.get(`/jobs/${jobId}`);
      const fetchedJob = res.data.job || res.data;
      setJob(fetchedJob);
    } catch (error) {
      // Use fake data if API fails
      const fakeJob = FAKE_JOBS.find(j => j._id === jobId);
      if (fakeJob) setJob(fakeJob);
      else setJob(FAKE_JOBS[0]); // Default to first job
    } finally {
      setLoadingJob(false);
    }
  };

  const loadUserData = () => {
    const userName = localStorage.getItem("userName");
    const userEmail = localStorage.getItem("email");
    if (userName || userEmail) {
      setFormData(prev => ({
        ...prev,
        fullName: userName || "",
        email: userEmail || ""
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleExperienceChange = (delta) => {
    setFormData(prev => ({
      ...prev,
      yearsExperience: Math.max(0, prev.yearsExperience + delta)
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        resumeFile: file,
        resumeFileName: file.name,
        resumeSize: (file.size / 1024).toFixed(2)
      }));
      setErrors(prev => ({
        ...prev,
        resume: ""
      }));
    }
  };

  const handleDragDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      setFormData(prev => ({
        ...prev,
        resumeFile: file,
        resumeFileName: file.name,
        resumeSize: (file.size / 1024).toFixed(2)
      }));
    }
  };

  const generateCoverLetterAI = async () => {
    setAiGenerating(true);
    try {
      const response = await API.post("/api/ai/cover-letter", {
        jobTitle: job?.title,
        company: job?.company,
        skills: job?.skills,
        experience: formData.yearsExperience,
        fullName: formData.fullName
      });
      
      const generatedText = response.data?.coverLetter || "Generated cover letter...";
      typewriterEffect(generatedText);
    } catch (error) {
      // Simulate AI response for demo
      const demoLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${job?.title} position at ${job?.company}. With ${formData.yearsExperience}+ years of professional experience in ${job?.skills?.[0] || 'technology'}, I am confident that I would be a valuable addition to your team.

Throughout my career, I have successfully developed and maintained complex applications, collaborating with cross-functional teams to deliver high-quality solutions. My expertise in ${job?.skills?.slice(0, 3).join(', ')} aligns perfectly with your requirements.

I am excited about the opportunity to contribute to ${job?.company} and would welcome the chance to discuss how my skills and experience can benefit your organization.

Thank you for considering my application.

Best regards,
${formData.fullName}`;
      typewriterEffect(demoLetter);
    } finally {
      setAiGenerating(false);
    }
  };

  const typewriterEffect = (text) => {
    setFormData(prev => ({
      ...prev,
      coverLetter: ""
    }));

    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setFormData(prev => ({
          ...prev,
          coverLetter: text.substring(0, index + 1)
        }));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 10);
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    } else if (step === 2) {
      if (!formData.resumeFile && !formData.resumeFileName) newErrors.resume = "Resume is required";
      if (formData.coverLetter.trim().length < 50) newErrors.coverLetter = "Cover letter must be at least 50 characters";
    } else if (step === 3) {
      if (!formData.agreeTerms) newErrors.terms = "You must agree to terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setSubmitting(true);
    try {
      const formPayload = new FormData();
      formPayload.append("fullName", formData.fullName);
      formPayload.append("email", formData.email);
      formPayload.append("phone", formData.phone);
      formPayload.append("linkedinUrl", formData.linkedinUrl);
      formPayload.append("portfolioUrl", formData.portfolioUrl);
      formPayload.append("yearsExperience", formData.yearsExperience);
      formPayload.append("jobId", jobId);
      formPayload.append("coverLetter", formData.coverLetter);
      if (formData.resumeFile) {
        formPayload.append("resume", formData.resumeFile);
      }

      await API.post(`/jobs/${jobId}/apply`, formPayload, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setIsSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 5000);
    } catch (error) {
      // For demo, just show success
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 5000);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingJob) {
    return <div className="apply-loading">Loading job details...</div>;
  }

  if (!job) {
    return <div className="apply-error">Job not found</div>;
  }

  if (isSuccess) {
    return (
      <div className="apply-container">
        <div className="success-container">
          <div className="success-card">
            <svg className="success-checkmark" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="25" fill="none"/>
              <path d="M14.1 27.2l7.1 7.2 16.7-16.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            
            <div className="confetti">
              {[...Array(30)].map((_, i) => (
                <div key={i} className="confetti-piece" style={{
                  '--delay': `${Math.random() * 0.5}s`,
                  '--duration': `${2 + Math.random() * 1}s`,
                  '--x': `${Math.random() * 100 - 50}px`,
                  '--angle': `${Math.random() * 360}deg`
                }}></div>
              ))}
            </div>

            <h2 className="success-title">Application Submitted!</h2>
            <p className="success-message">Thank you for applying. We'll review your application and get back to you soon.</p>

            <div className="success-actions">
              <button className="btn-track" onClick={() => navigate("/dashboard")}>
                ?? Track Application
              </button>
              <button className="btn-browse" onClick={() => navigate("/")}>
                ?? Browse More Jobs
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="apply-container">
      {/* Left Panel - Job Summary (40%) */}
      <div className="apply-left-panel">
        <div className="job-summary-card">
          {/* Company Logo */}
          <div className="job-logo-section">
            <div className="job-logo">{job.logo || "??"}</div>
          </div>

          {/* Job Info */}
          <div className="job-info-section">
            <h2 className="job-title">{job.title}</h2>
            <p className="job-company">{job.company}</p>
            <div className="job-meta">
              <span className="meta-item">?? {job.location}</span>
              <span className="meta-item">?? -{job.salary?.[1]?.toLocaleString()}</span>
            </div>
          </div>

          {/* Deadline Badge */}
          <div className="deadline-badge">
            ? {daysLeft} days left to apply
          </div>

          {/* Description Preview */}
          <div className="job-description">
            <h3>About the Job</h3>
            <p className={showExpandedDesc ? "expanded" : "truncated"}>
              {job.description}
            </p>
            {!showExpandedDesc && (
              <button 
                className="expand-btn"
                onClick={() => setShowExpandedDesc(true)}
              >
                View Full Description ?
              </button>
            )}
          </div>

          {/* Requirements */}
          <div className="job-requirements">
            <h3>Requirements</h3>
            <ul className="requirements-list">
              {job.requirements?.map((req, idx) => (
                <li key={idx} className="requirement-item">
                  <svg className="checkmark-icon" viewBox="0 0 24 24">
                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="currentColor"/>
                  </svg>
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* Skills */}
          <div className="job-skills">
            <h3>Required Skills</h3>
            <div className="skills-tags">
              {job.skills?.map((skill, idx) => (
                <span key={idx} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Application Form (60%) */}
      <div className="apply-right-panel">
        <div className="apply-form-card">
          {/* Step Progress */}
          <div className="step-progress">
            {[1, 2, 3].map((step) => (
              <div key={step} className={`step ${currentStep >= step ? "active" : ""} ${currentStep === step ? "current" : ""}`}>
                <div className="step-circle">{step}</div>
                <span className="step-label">
                  {step === 1 ? "Personal Info" : step === 2 ? "Resume & Letter" : "Review"}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="form-step">
                <h3>Your Information</h3>

                <div className="form-group">
                  <label>?? Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={errors.fullName ? "error" : ""}
                  />
                  {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>?? Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className={errors.email ? "error" : ""}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label>?? Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                      className={errors.phone ? "error" : ""}
                    />
                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>?? LinkedIn Profile <span className="optional">(Optional)</span></label>
                    <input
                      type="url"
                      name="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleInputChange}
                      placeholder="linkedin.com/in/johndoe"
                    />
                  </div>

                  <div className="form-group">
                    <label>??? Portfolio <span className="optional">(Optional)</span></label>
                    <input
                      type="url"
                      name="portfolioUrl"
                      value={formData.portfolioUrl}
                      onChange={handleInputChange}
                      placeholder="yourportfolio.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>?? Years of Experience</label>
                  <div className="experience-stepper">
                    <button 
                      type="button"
                      className="stepper-btn minus"
                      onClick={() => handleExperienceChange(-1)}
                    >
                      -
                    </button>
                    <span className="experience-value">{formData.yearsExperience} years</span>
                    <button 
                      type="button"
                      className="stepper-btn plus"
                      onClick={() => handleExperienceChange(1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Resume & Cover Letter */}
            {currentStep === 2 && (
              <div className="form-step">
                <h3>Resume & Cover Letter</h3>

                {/* Resume Upload */}
                <div className="form-group">
                  <label>?? Resume *</label>
                  <div 
                    className="file-upload-zone"
                    onDrop={handleDragDrop}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <svg className="upload-icon" viewBox="0 0 24 24">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
                    </svg>
                    <p className="upload-text">Drag & drop your PDF resume here</p>
                    <p className="upload-subtext">or</p>
                    <button 
                      type="button"
                      className="btn-browse-file"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Browse Files
                    </button>
                    <input 
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      style={{ display: "none" }}
                    />
                  </div>

                  {formData.resumeFileName && (
                    <div className="file-preview">
                      <div className="file-info">
                        <svg className="pdf-icon" viewBox="0 0 24 24">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <div className="file-details">
                          <p className="file-name">{formData.resumeFileName}</p>
                          <p className="file-size">{formData.resumeSize} KB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => setFormData(prev => ({...prev, resumeFile: null, resumeFileName: ""}))}
                      >
                        ?
                      </button>
                    </div>
                  )}

                  {errors.resume && <span className="error-text">{errors.resume}</span>}
                </div>

                {/* Cover Letter */}
                <div className="form-group">
                  <div className="cover-letter-header">
                    <label>?? Cover Letter *</label>
                    <button 
                      type="button"
                      className="btn-ai-generate"
                      onClick={generateCoverLetterAI}
                      disabled={aiGenerating}
                    >
                      {aiGenerating ? "? Generating..." : "? Generate with AI"}
                    </button>
                  </div>
                  <textarea
                    ref={coverLetterRef}
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleInputChange}
                    placeholder="Tell us why you're perfect for this role..."
                    className={`cover-letter-textarea ${errors.coverLetter ? "error" : ""}`}
                  />
                  <div className="textarea-footer">
                    <span className="char-count">{formData.coverLetter.length} characters</span>
                    {errors.coverLetter && <span className="error-text">{errors.coverLetter}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="form-step">
                <h3>Review Your Application</h3>

                <div className="review-section">
                  <div className="review-header">
                    <h4>Personal Information</h4>
                    <button 
                      type="button"
                      className="btn-edit"
                      onClick={() => setCurrentStep(1)}
                    >
                      Edit
                    </button>
                  </div>
                  <div className="review-content">
                    <p><strong>Name:</strong> {formData.fullName}</p>
                    <p><strong>Email:</strong> {formData.email}</p>
                    <p><strong>Phone:</strong> {formData.phone}</p>
                    {formData.linkedinUrl && <p><strong>LinkedIn:</strong> {formData.linkedinUrl}</p>}
                    {formData.portfolioUrl && <p><strong>Portfolio:</strong> {formData.portfolioUrl}</p>}
                    <p><strong>Experience:</strong> {formData.yearsExperience} years</p>
                  </div>
                </div>

                <div className="review-section">
                  <div className="review-header">
                    <h4>Resume & Cover Letter</h4>
                    <button 
                      type="button"
                      className="btn-edit"
                      onClick={() => setCurrentStep(2)}
                    >
                      Edit
                    </button>
                  </div>
                  <div className="review-content">
                    {formData.resumeFileName && (
                      <p><strong>Resume:</strong> {formData.resumeFileName} ({formData.resumeSize} KB)</p>
                    )}
                    <p><strong>Cover Letter:</strong> {formData.coverLetter.substring(0, 100)}...</p>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="form-group terms-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={(e) => setFormData(prev => ({...prev, agreeTerms: e.target.checked}))}
                      className="checkbox-input"
                    />
                    <span className="checkbox-custom"></span>
                    <span className="checkbox-text">
                      I agree to the terms and conditions and confirm that the information above is accurate.
                    </span>
                  </label>
                  {errors.terms && <span className="error-text">{errors.terms}</span>}
                </div>
              </div>
            )}

            {/* Button Controls */}
            <div className="form-controls">
              {currentStep > 1 && (
                <button 
                  type="button"
                  className="btn-prev"
                  onClick={handlePrevStep}
                >
                  ? Back
                </button>
              )}

              {currentStep < 3 ? (
                <button 
                  type="button"
                  className="btn-next"
                  onClick={handleNextStep}
                >
                  Next ?
                </button>
              ) : (
                <button 
                  type="submit"
                  className="btn-submit"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplyJob;
