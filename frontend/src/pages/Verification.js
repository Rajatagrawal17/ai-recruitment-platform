import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import "./Verification.css";

const Verification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state?.userData;

  const [step, setStep] = useState(1); // 1: Mobile OTP, 2: Email OTP, 3: CAPTCHA
  const [mobileMethod, setMobileMethod] = useState("sms"); // sms or email for mobile verification
  const [mobileOtp, setMobileOtp] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPhoneInput, setShowPhoneInput] = useState(!userData?.phoneNumber);

  const [timerMobile, setTimerMobile] = useState(0);
  const [timerEmail, setTimerEmail] = useState(0);
  const [verifiedSteps, setVerifiedSteps] = useState({
    mobileOtp: false,
    emailOtp: false,
    captcha: false,
  });

  // Redirect if no userData
  useEffect(() => {
    if (!userData) {
      navigate("/register");
    }
  }, [userData, navigate]);

  // Load Google reCAPTCHA
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setRecaptchaReady(true);
      if (step === 3) {
        window.grecaptcha.render("recaptcha-container", {
          sitekey: process.env.REACT_APP_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI", // Demo key
          callback: onCaptchaSuccess,
          "expired-callback": onCaptchaExpired,
        });
      }
    };
    document.head.appendChild(script);
  }, []);

  // Re-render reCAPTCHA when step changes
  useEffect(() => {
    if (step === 3 && window.grecaptcha) {
      setTimeout(() => {
        window.grecaptcha.render("recaptcha-container", {
          sitekey: process.env.REACT_APP_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI",
          callback: onCaptchaSuccess,
          "expired-callback": onCaptchaExpired,
        });
      }, 100);
    }
  }, [step]);

  // Timers for resend
  useEffect(() => {
    if (timerMobile > 0) {
      const interval = setInterval(() => setTimerMobile((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timerMobile]);

  useEffect(() => {
    if (timerEmail > 0) {
      const interval = setInterval(() => setTimerEmail((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timerEmail]);

  const onCaptchaSuccess = (token) => {
    setCaptchaToken(token);
    setError("");
  };

  const onCaptchaExpired = () => {
    setCaptchaToken(null);
  };

  const handleSendMobileOtp = async () => {
    if (!phoneNumber && !userData?.phoneNumber) {
      setError("Please enter phone number");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const phone = phoneNumber || userData?.phoneNumber;
      await API.post("/auth/send-mobile-otp", {
        phoneNumber: phone,
        method: mobileMethod,
        email: userData?.email,
      });
      setSuccess(`✓ OTP sent via ${mobileMethod === "sms" ? "SMS" : "Email"}`);
      setTimerMobile(600); // 10 minutes
      setShowPhoneInput(false);
      setMobileOtp("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMobileOtp = async () => {
    if (!mobileOtp || mobileOtp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await API.post("/auth/verify-mobile-otp", {
        phoneNumber: phoneNumber || userData?.phoneNumber,
        otp: mobileOtp,
      });
      setVerifiedSteps({ ...verifiedSteps, mobileOtp: true });
      setSuccess("✓ Mobile verified!");
      setTimeout(() => {
        setStep(2);
        setSuccess("");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailOtp = async () => {
    setLoading(true);
    setError("");
    try {
      await API.post("/auth/send-email-otp", {
        email: userData?.email,
      });
      setSuccess("✓ OTP sent to email");
      setTimerEmail(600);
      setEmailOtp("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtp || emailOtp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await API.post("/auth/verify-email-otp", {
        email: userData?.email,
        otp: emailOtp,
      });
      setVerifiedSteps({ ...verifiedSteps, emailOtp: true });
      setSuccess("✓ Email verified!");
      setTimeout(() => {
        setStep(3);
        setSuccess("");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCaptcha = async () => {
    if (!captchaToken) {
      setError("Please complete CAPTCHA verification");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await API.post("/auth/verify-captcha", {
        token: captchaToken,
      });

      if (response.data.success) {
        setVerifiedSteps({ ...verifiedSteps, captcha: true });
        setSuccess("✓ CAPTCHA verified!");

        // Complete registration
        setTimeout(async () => {
          try {
            await API.post("/auth/register", {
              ...userData,
              phoneNumber: phoneNumber || userData?.phoneNumber,
              verified: true,
            });

            setSuccess("✓ Account created successfully!");
            setTimeout(() => {
              navigate("/login");
            }, 1500);
          } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
          }
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "CAPTCHA verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (!userData) return null;

  return (
    <div className="verification-container">
      {/* Background Orbs */}
      <div className="verification-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>

      <div className="verification-wrapper">
        {/* Left Panel - User Info & Progress */}
        <div className="verification-sidebar">
          <div className="sidebar-content">
            <div className="user-welcome">
              <h3>Welcome Back!</h3>
              <p className="user-name">👤 {userData?.name}</p>
              <p className="user-email">📧 {userData?.email}</p>
            </div>

            <div className="steps-timeline">
              <div className={`timeline-step ${step >= 1 ? "active" : ""} ${verifiedSteps.mobileOtp ? "completed" : ""}`}>
                <div className="step-marker">
                  {verifiedSteps.mobileOtp ? "✓" : "1"}
                </div>
                <div className="step-info">
                  <h4>Mobile OTP</h4>
                  <p>Verify your phone</p>
                </div>
              </div>

              <div className="timeline-connector" style={{ opacity: step >= 2 ? 1 : 0.3 }}></div>

              <div className={`timeline-step ${step >= 2 ? "active" : ""} ${verifiedSteps.emailOtp ? "completed" : ""}`}>
                <div className="step-marker">
                  {verifiedSteps.emailOtp ? "✓" : "2"}
                </div>
                <div className="step-info">
                  <h4>Email OTP</h4>
                  <p>Verify your email</p>
                </div>
              </div>

              <div className="timeline-connector" style={{ opacity: step >= 3 ? 1 : 0.3 }}></div>

              <div className={`timeline-step ${step >= 3 ? "active" : ""} ${verifiedSteps.captcha ? "completed" : ""}`}>
                <div className="step-marker">
                  {verifiedSteps.captcha ? "✓" : "3"}
                </div>
                <div className="step-info">
                  <h4>CAPTCHA</h4>
                  <p>Verify humanity</p>
                </div>
              </div>
            </div>

            <div className="security-badge">
              <span className="badge-icon">🔒</span>
              <span className="badge-text">Bank-level security</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Verification Form */}
        <div className="verification-main">
          {/* Error and Success Messages */}
          {error && <div className="message error">⚠️ {error}</div>}
          {success && <div className="message success">{success}</div>}

          {/* Step 1: Mobile OTP */}
          {step === 1 && (
            <div className="verification-step">
              <div className="step-header">
                <h2>📱 Mobile Verification</h2>
                <p>Enter your mobile number and verify with an OTP</p>
              </div>

              {!verifiedSteps.mobileOtp ? (
                <>
                  {showPhoneInput && (
                    <div className="step-input-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="step-input"
                      />
                    </div>
                  )}

                  <div className="method-selector">
                    <label className="method-option">
                      <input
                        type="radio"
                        value="sms"
                        checked={mobileMethod === "sms"}
                        onChange={(e) => setMobileMethod(e.target.value)}
                      />
                      <span>📲 SMS</span>
                    </label>
                    <label className="method-option">
                      <input
                        type="radio"
                        value="email"
                        checked={mobileMethod === "email"}
                        onChange={(e) => setMobileMethod(e.target.value)}
                      />
                      <span>📧 Email</span>
                    </label>
                  </div>

                  <button
                    onClick={handleSendMobileOtp}
                    disabled={loading || timerMobile > 0}
                    className="btn-primary btn-full"
                  >
                    {timerMobile > 0
                      ? `⏱️ Resend in ${Math.floor(timerMobile / 60)}:${(timerMobile % 60).toString().padStart(2, "0")}`
                      : `Send OTP via ${mobileMethod === "sms" ? "SMS" : "Email"}`}
                  </button>

                  {timerMobile > 0 && (
                    <button
                      onClick={() => {
                        setTimerMobile(0);
                        setMobileOtp("");
                        setShowPhoneInput(true);
                      }}
                      className="btn-again"
                    >
                      Send Again
                    </button>
                  )}

                  <div className="step-input-group">
                    <label>Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      placeholder="000000"
                      value={mobileOtp}
                      onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      maxLength="6"
                      className="otp-input"
                    />
                    <div className="otp-indicator">
                      {mobileOtp.split("").map((digit, i) => (
                        <span key={i} className={`digit ${digit ? "filled" : ""}`}>
                          {digit || "•"}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleVerifyMobileOtp}
                    disabled={loading || !mobileOtp || mobileOtp.length !== 6}
                    className="btn-secondary btn-full"
                  >
                    {loading ? "⏳ Verifying..." : "Verify OTP"}
                  </button>
                </>
              ) : (
                <div className="verified-badge">
                  <span className="checkmark">✓</span>
                  <p>Mobile number verified</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Email OTP */}
          {step === 2 && (
            <div className="verification-step">
              <div className="step-header">
                <h2>📧 Email Verification</h2>
                <p>Verify your email address with an OTP</p>
              </div>

              <div className="email-display">
                <span>📨 {userData?.email}</span>
              </div>

              {!verifiedSteps.emailOtp ? (
                <>
                  <button
                    onClick={handleSendEmailOtp}
                    disabled={loading || timerEmail > 0}
                    className="btn-primary btn-full"
                  >
                    {timerEmail > 0
                      ? `⏱️ Resend in ${Math.floor(timerEmail / 60)}:${(timerEmail % 60).toString().padStart(2, "0")}`
                      : "Send OTP"}
                  </button>

                  {timerEmail > 0 && (
                    <button
                      onClick={() => {
                        setTimerEmail(0);
                        setEmailOtp("");
                      }}
                      className="btn-again"
                    >
                      Send Again
                    </button>
                  )}

                  <div className="step-input-group">
                    <label>Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      placeholder="000000"
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      maxLength="6"
                      className="otp-input"
                    />
                    <div className="otp-indicator">
                      {emailOtp.split("").map((digit, i) => (
                        <span key={i} className={`digit ${digit ? "filled" : ""}`}>
                          {digit || "•"}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleVerifyEmailOtp}
                    disabled={loading || !emailOtp || emailOtp.length !== 6}
                    className="btn-secondary btn-full"
                  >
                    {loading ? "⏳ Verifying..." : "Verify OTP"}
                  </button>

                  <button
                    onClick={() => setStep(1)}
                    className="btn-back"
                  >
                    ← Back to Previous Step
                  </button>
                </>
              ) : (
                <div className="verified-badge">
                  <span className="checkmark">✓</span>
                  <p>Email verified</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: CAPTCHA */}
          {step === 3 && (
            <div className="verification-step">
              <div className="step-header">
                <h2>🤖 Verify You're Human</h2>
                <p>Complete the CAPTCHA to secure your account</p>
              </div>

              {!verifiedSteps.captcha ? (
                <>
                  <div id="recaptcha-container" className="recaptcha-container"></div>

                  <button
                    onClick={handleSubmitCaptcha}
                    disabled={loading || !captchaToken}
                    className="btn-primary btn-full"
                  >
                    {loading ? "⏳ Creating Account..." : "✓ Complete Registration"}
                  </button>

                  <button
                    onClick={() => setStep(2)}
                    className="btn-back"
                  >
                    ← Back to Previous Step
                  </button>
                </>
              ) : (
                <div className="verified-badge">
                  <span className="checkmark">✓</span>
                  <p>Human verification confirmed</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Verification;
