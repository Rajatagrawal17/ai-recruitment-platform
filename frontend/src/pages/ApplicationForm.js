import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MatchScoreBadge from "../components/MatchScoreBadge";
import AnimatedResumeUpload from "../components/AnimatedResumeUpload";
import AnimatedFormField from "../components/AnimatedFormField";
import { NotificationContainer } from "../components/AnimatedNotification";
import { MobileOptimizedContainer, MobileOptimizedButton } from "../components/MobileOptimizedAnimations";
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
  const [notifications, setNotifications] = useState([]);

  const addNotification = (type, title, message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, type, title, message }]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

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
      addNotification("success", "Application Submitted!", "Your application has been received and will be reviewed soon.");
    } catch (err) {
      const rawMessage = err.response?.data?.message || "Failed to submit application.";
      const normalized = String(rawMessage).toLowerCase();

      if (
        normalized.includes("token failed") ||
        normalized.includes("no token") ||
        normalized.includes("not authorized") ||
        normalized.includes("jwt") ||
        normalized.includes("expired")
      ) {
        const errorMsg = "Your session expired. Please login again and re-submit this application.";
        setError(errorMsg);
        addNotification("error", "Session Expired", errorMsg);
        return;
      }

      if (err.code === "ECONNABORTED" || normalized.includes("timeout")) {
        const errorMsg = "Application submission took too long. Please retry with a smaller resume file or try again in a moment.";
        setError(errorMsg);
        addNotification("error", "Submission Timeout", errorMsg);
        return;
      }

      setError(rawMessage);
      addNotification("error", "Submission Failed", rawMessage);
    } finally {
      setLoading(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } },
  };

  if (result) {
    return (
      <main className="recruit-page">
        <NotificationContainer notifications={notifications} onRemove={removeNotification} />
        <MobileOptimizedContainer>
          <motion.section
            className="recruit-shell recruit-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-green-600 font-bold text-2xl mb-4"
            >
              ✅ Application Submitted Successfully
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="recruit-muted text-center mb-6"
            >
              Your profile has been scored by the matching engine.
            </motion.p>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <MatchScoreBadge score={result.matchScore || 0} />
            </motion.div>
            <div className="recruit-actions flex gap-4 justify-center">
              <MobileOptimizedButton
                className="recruit-btn primary"
                onClick={() => navigate("/candidate/dashboard")}
              >
                Go to Dashboard
              </MobileOptimizedButton>
              <MobileOptimizedButton
                className="recruit-btn secondary"
                onClick={() => navigate("/jobs")}
              >
                Browse More Jobs
              </MobileOptimizedButton>
            </div>
          </motion.section>
        </MobileOptimizedContainer>
      </main>
    );
  }

  return (
    <main className="recruit-page">
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
      <MobileOptimizedContainer>
        <motion.section
          className="recruit-shell recruit-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 0 }}
          >
            Apply to Job
          </motion.h1>

          <motion.div
            className="flex justify-between items-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <p className="recruit-muted">Step {step} of 3</p>
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <motion.div
                  key={s}
                  className={`w-3 h-3 rounded-full transition-all ${
                    s <= step ? "bg-indigo-600" : "bg-gray-300"
                  }`}
                  animate={s === step ? { scale: 1.2 } : { scale: 1 }}
                />
              ))}
            </div>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
              >
                <AnimatedFormField
                  index={0}
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={updateField}
                  placeholder="John Doe"
                  required
                />
                <AnimatedFormField
                  index={1}
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={updateField}
                  placeholder="john@example.com"
                  required
                />
                <AnimatedFormField
                  index={2}
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={updateField}
                  placeholder="+1 (555) 000-0000"
                  required
                />
                <AnimatedFormField
                  index={3}
                  label="Years of Experience"
                  name="yearsExperience"
                  type="number"
                  min="0"
                  value={formData.yearsExperience}
                  onChange={updateField}
                  placeholder="5"
                />
                <motion.div
                  custom={4}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter (Optional)
                  </label>
                  <motion.textarea
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={updateField}
                    placeholder="Tell us why you're interested in this position..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    rows="4"
                    whileFocus={{ scale: 1.02 }}
                  />
                </motion.div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <AnimatedResumeUpload
                  file={resumeFile}
                  onFileChange={setResumeFile}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 }}
                  className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg"
                >
                  <p className="mb-2">
                    <strong>Full Name:</strong> {formData.fullName}
                  </p>
                  <p className="mb-2">
                    <strong>Email:</strong> {formData.email}
                  </p>
                  <p className="mb-2">
                    <strong>Phone:</strong> {formData.phone}
                  </p>
                  <p className="mb-2">
                    <strong>Experience:</strong> {formData.yearsExperience} years
                  </p>
                  <p>
                    <strong>Resume:</strong> {resumeFile?.name}
                  </p>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-gray-600"
                >
                  Please review your information before submitting. You won't be able to edit it after submission.
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="recruit-actions flex gap-4 mt-8 flex-col md:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {step > 1 && (
              <MobileOptimizedButton
                className="recruit-btn secondary flex-1"
                type="button"
                onClick={() => setStep((prev) => prev - 1)}
              >
                ← Back
              </MobileOptimizedButton>
            )}
            {step < 3 && (
              <MobileOptimizedButton
                className="recruit-btn primary flex-1"
                type="button"
                onClick={() => {
                  if (!validateStep()) {
                    setError("Please complete required fields before continuing.");
                    addNotification("error", "Missing Fields", "Please complete all required fields.");
                    return;
                  }
                  setError("");
                  setStep((prev) => prev + 1);
                }}
              >
                Next →
              </MobileOptimizedButton>
            )}
            {step === 3 && (
              <MobileOptimizedButton
                className={`recruit-btn primary flex-1 ${loading ? "opacity-50" : ""}`}
                type="button"
                onClick={submitApplication}
                disabled={loading}
              >
                {loading ? (
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    Submitting...
                  </motion.span>
                ) : (
                  "Submit Application"
                )}
              </MobileOptimizedButton>
            )}
          </motion.div>
        </motion.section>
      </MobileOptimizedContainer>
    </main>
  );
};

export default ApplicationForm;
