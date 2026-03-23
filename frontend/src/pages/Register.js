import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API, { warmupBackend } from "../services/api";
import "./Register.css";
import ReCAPTCHA from "react-google-recaptcha";

const Register = () => {
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    phoneNumber: "",
    role: "candidate" 
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationStep, setVerificationStep] = useState(1);
  const [otpValue, setOtpValue] = useState("");
  const [timer, setTimer] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    }
  }, [timer]);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const normalizeIndianPhone = (phone = "") => {
    const digits = phone.replace(/\D/g, "");

    if (digits.length === 10) {
      return `+91${digits}`;
    }

    if (digits.length === 12 && digits.startsWith("91")) {
      return `+${digits}`;
    }

    return null;
  };

  const postWithRetry = async (url, payload, retries = 2) => {
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await API.post(url, payload);
      } catch (err) {
        lastError = err;
        const isNetworkIssue = err.code === "ERR_NETWORK" || err.code === "ECONNABORTED" || !err.response;
        if (!isNetworkIssue || attempt === retries) {
          throw err;
        }
        await sleep(1500 * (attempt + 1));
      }
    }

    throw lastError;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phoneNumber") {
      const cleaned = value.replace(/[^\d+]/g, "");
      setFormData({ ...formData, phoneNumber: cleaned });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    setError("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.password || formData.password.length < 6) return "Password must be at least 6 characters";
    if (!normalizeIndianPhone(formData.phoneNumber)) return "Enter a valid Indian phone number (+91XXXXXXXXXX or 10 digits)";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const normalizedPhone = normalizeIndianPhone(formData.phoneNumber);
    setFormData((prev) => ({ ...prev, phoneNumber: normalizedPhone }));

    setShowVerification(true);
    setVerificationStep(1);
    setError("");
    await sendMobileOTP();
  };

  const sendMobileOTP = async () => {
    try {
      setVerifying(true);

      // Render free instances can sleep; warm up backend before OTP request.
      await warmupBackend();

      const normalizedPhone = normalizeIndianPhone(formData.phoneNumber);

      await postWithRetry("/auth/send-mobile-otp", {
        phoneNumber: normalizedPhone,
        method: "sms",
      });

      setError("");
      setAttempts(0);
      setTimer(300); // 5 minutes
      setOtpValue("");
      setVerifying(false);
    } catch (err) {
      const apiMessage = err.response?.data?.message;
      const networkMessage = err.code === "ERR_NETWORK"
        ? "Server is still waking up. Please wait 60 seconds and tap Resend Code."
        : null;
      setError(apiMessage || networkMessage || "Failed to send OTP");
      setVerifying(false);
    }
  };

  const verifyMobileOTP = async () => {
    try {
      setVerifying(true);

      const normalizedPhone = normalizeIndianPhone(formData.phoneNumber);
      await API.post("/auth/verify-mobile-otp", {
        phoneNumber: normalizedPhone,
        otp: otpValue,
      });

      setError("");
      setVerificationStep(2);
      setVerifying(false);
    } catch (err) {
      setAttempts(attempts + 1);
      setError(err.response?.data?.message || "Invalid OTP");
      if (attempts + 1 >= 3) {
        setTimer(0);
        await sendMobileOTP();
        setAttempts(0);
      }
      setVerifying(false);
    }
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
    setError("");
  };

  const completeRegistration = async () => {
    try {
      if (!captchaToken) {
        setError("Please complete the CAPTCHA");
        return;
      }

      setVerifying(true);
      
      // Verify CAPTCHA
      const captchaResponse = await API.post("/auth/verify-captcha", {
        token: captchaToken,
      });

      if (!captchaResponse.data.success) {
        setError("CAPTCHA verification failed");
        setCaptchaToken(null);
        setVerifying(false);
        return;
      }

      // Create account
      const registerResponse = await API.post("/auth/register", {
        ...formData,
        verified: true,
        mobileVerified: true,
        emailVerified: false,
      });

      setSuccess("✅ Account created successfully!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      setVerifying(false);

    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      setVerifying(false);
    }
  };

  return (
    <div className="register-container">
      {!showVerification ? (
        <div className="register-card">
          <div className="card-header">
            <h2>🚀 Create Your Account</h2>
            <p>Join the AI Recruitment Platform</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="form-group">
              <label>👤 Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>📧 Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>📱 Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="+919876543210"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="form-input"
              />
              <small className="phone-helper">Use +91XXXXXXXXXX or 10 digits</small>
            </div>

            <div className="form-group">
              <label>🔑 Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide" : "Show"}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>👥 Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className="form-select">
                <option value="candidate">👤 Candidate</option>
                <option value="recruiter">🏢 Recruiter</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Processing..." : "Register & Verify"}
            </button>

            <p className="login-link">
              Already have an account? <a href="/login">Sign In</a>
            </p>
          </form>
        </div>
      ) : (
        <div className="verification-modal">
          <div className="verification-overlay" onClick={() => setShowVerification(false)} />
          <div className="verification-card">
            <button className="close-btn" onClick={() => setShowVerification(false)}>✕</button>

            {/* Step 1: Mobile OTP */}
            {verificationStep === 1 && (
              <div className="verification-step">
                <h3>📱 Verify Your Phone</h3>
                <p className="step-description">We've sent a verification code to <strong>{normalizeIndianPhone(formData.phoneNumber) || formData.phoneNumber}</strong></p>

                {error && <div className="alert alert-error">{error}</div>}

                <div className="otp-input">
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="000000"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/[^0-9]/g, ""))}
                    className="otp-field"
                  />
                </div>

                <div className="timer-section">
                  {timer > 0 ? (
                    <p>Resend code in <strong>{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}</strong></p>
                  ) : (
                    <button className="btn-resend" onClick={sendMobileOTP} disabled={verifying}>
                      Resend Code
                    </button>
                  )}
                  {attempts > 0 && <p className="attempts-left">Attempts remaining: {3 - attempts}</p>}
                </div>

                <button
                  className="btn-verify"
                  onClick={verifyMobileOTP}
                  disabled={otpValue.length !== 6 || verifying}
                >
                  {verifying ? "Verifying..." : "Verify"}
                </button>
              </div>
            )}

            {/* Step 2: CAPTCHA */}
            {verificationStep === 2 && (
              <div className="verification-step">
                <h3>🤖 Complete Verification</h3>
                <p className="step-description">Confirm you're human to complete registration</p>

                {error && <div className="alert alert-error">{error}</div>}

                <div className="captcha-container">
                  <ReCAPTCHA
                    sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                    onChange={handleCaptchaChange}
                    theme="dark"
                  />
                </div>

                <button
                  className="btn-complete"
                  onClick={completeRegistration}
                  disabled={!captchaToken || verifying}
                >
                  {verifying ? "Creating Account..." : "Complete Registration"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;