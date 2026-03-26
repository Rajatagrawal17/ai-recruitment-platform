import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  forgotPassword,
  sendResetOTP,
  verifyResetOTP,
  resetPassword,
} from "../services/api";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("email"); // email, otp, reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [method, setMethod] = useState("email");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [fallbackCode, setFallbackCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Handle email submission
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword({ email });
      if (response.data.success) {
        setSuccess("OTP has been sent to your email");
        setDemoOtp(response.data.demoOtp);
        setFallbackCode(response.data.fallbackCode);
        setStep("otp");
        setResendTimer(60);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP submission
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await verifyResetOTP({ email, otp });
      if (response.data.success) {
        setResetToken(response.data.resetToken);
        setSuccess("OTP verified! Now set your new password.");
        setStep("reset");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword({
        email,
        newPassword,
        resetToken,
      });
      if (response.data.success) {
        setSuccess("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setError("");
    setLoading(true);
    try {
      const response = await sendResetOTP({ email, method });
      if (response.data.success) {
        setSuccess(`OTP resent via ${method}`);
        setDemoOtp(response.data.demoOtp);
        setFallbackCode(response.data.fallbackCode);
        setResendTimer(60);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer
  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      className="forgot-password-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="forgot-password-card">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          🔐 Reset Password
        </motion.h1>

        {error && (
          <motion.div
            className="alert alert-error"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            ❌ {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            className="alert alert-success"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            ✅ {success}
          </motion.div>
        )}

        {/* Step 1: Email */}
        {step === "email" && (
          <motion.form
            onSubmit={handleEmailSubmit}
            className="forgot-password-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </motion.button>
          </motion.form>
        )}

        {/* Step 2: OTP Verification */}
        {step === "otp" && (
          <motion.form
            onSubmit={handleOtpSubmit}
            className="forgot-password-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="otp-info">
              <p>📧 OTP sent to: <strong>{email}</strong></p>
              {demoOtp && (
                <div className="demo-otp">
                  <p>Demo OTP: <code>{demoOtp}</code></p>
                </div>
              )}
              {fallbackCode && (
                <div className="fallback-code">
                  <p>Or use fallback code: <code>{fallbackCode}</code></p>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9-]/g, ""))}
                disabled={loading}
                maxLength="9"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </motion.button>

            <div className="resend-section">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendTimer > 0 || loading}
                className="resend-btn"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
              </button>
            </div>
          </motion.form>
        )}

        {/* Step 3: Reset Password */}
        {step === "reset" && (
          <motion.form
            onSubmit={handlePasswordReset}
            className="forgot-password-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="password-input-wrapper">
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-password"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </motion.button>
          </motion.form>
        )}

        <div className="form-footer">
          <p>
            Remember your password?{" "}
            <Link to="/login" className="link">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ForgotPassword;
