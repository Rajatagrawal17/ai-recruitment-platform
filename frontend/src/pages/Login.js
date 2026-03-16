import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShake(false);
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userName", res.data.userName || formData.email.split("@")[0]);
      setSuccess(true);
      setTimeout(() => {
        navigate("/jobs");
      }, 500);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Login failed";
      setErrors({ form: errorMsg });
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Animated Background Orbs */}
      <div className="background-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Content */}
      <div className={`login-content ${shake ? "shake" : ""} ${success ? "success" : ""}`}>
        {/* AI Logo */}
        <div className="ai-logo">
          <svg viewBox="0 0 100 100" width="80" height="80">
            {/* Brain/Circuit icon */}
            <circle cx="30" cy="30" r="5" fill="#4f46e5" className="circuit-node" />
            <circle cx="70" cy="30" r="5" fill="#06b6d4" className="circuit-node" />
            <circle cx="50" cy="70" r="5" fill="#f59e0b" className="circuit-node" />
            <line x1="30" y1="30" x2="50" y2="70" stroke="#4f46e5" strokeWidth="1.5" opacity="0.6" />
            <line x1="70" y1="30" x2="50" y2="70" stroke="#06b6d4" strokeWidth="1.5" opacity="0.6" />
            <line x1="30" y1="30" x2="70" y2="30" stroke="#f59e0b" strokeWidth="1.5" opacity="0.4" />
            <path d="M 35 50 Q 50 45 65 50" stroke="#4f46e5" fill="none" strokeWidth="1" className="pulse-line" />
          </svg>
        </div>

        {/* Glass Card */}
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Sign in to your AI recruitment dashboard</p>
          </div>

          {/* Form Error */}
          {errors.form && (
            <div className="form-error-banner">
              <span>⚠️</span>
              <p>{errors.form}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Field */}
            <div className="form-group">
              <div className="input-wrapper">
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder=" "
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? "error" : ""}`}
                  autoComplete="email"
                />
                <label htmlFor="email" className="floating-label">
                  Email Address
                </label>
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder=" "
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input ${errors.password ? "error" : ""}`}
                  autoComplete="current-password"
                />
                <label htmlFor="password" className="floating-label">
                  Password
                </label>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  )}
                </button>
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>
            </div>

            {/* Forgot Password */}
            <div className="form-footer">
              <Link to="/forgot-password" className="forgot-password">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className={`submit-btn ${loading ? "loading" : ""} ${success ? "success" : ""}`}
            >
              {success ? (
                <>
                  <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Signed In
                </>
              ) : loading ? (
                <>
                  <div className="spinner"></div>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">
            <span>or continue with</span>
          </div>

          {/* OAuth Button */}
          <button className="oauth-btn google-btn" type="button" title="Sign in with Google">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>

          {/* Sign Up Link */}
          <div className="login-footer">
            <p>
              Don't have an account?{" "}
              <Link to="/register" className="signup-link">
                Register now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;