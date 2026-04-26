import axios from "axios";

// 🔧 BULLETPROOF API URL DETECTION - Logs everything for debugging
const getApiUrl = () => {
  console.log("🔍 [URL Detection] Starting URL detection...");
  console.log("   window.location.hostname:", typeof window !== "undefined" ? window.location.hostname : "N/A");
  console.log("   REACT_APP_API_URL env:", process.env.REACT_APP_API_URL);
  console.log("   NODE_ENV:", process.env.NODE_ENV);

  // PRIORITY 1: RENDER PRODUCTION (onrender.com domains)
  if (typeof window !== "undefined" && window.location.hostname.includes("onrender.com")) {
    console.log("✅ [URL Detection] Detected RENDER PRODUCTION domain");
    
    const hostname = window.location.hostname;
    console.log("   Hostname:", hostname);

    if (hostname.includes("frontend")) {
      // Auto-detect: cognifit-frontend-6coo.onrender.com → cognifit-backend-6coo.onrender.com
      const backendHost = hostname.replace("frontend", "backend");
      const apiUrl = `https://${backendHost}`;
      console.log("✅ [URL Detection] AUTO-DETECTED backend:", apiUrl);
      return apiUrl;
    }
    
    // Fallback for other Render hostname formats
    const fallbackUrl = "https://cognifit-backend.onrender.com";
    console.log("⚠️ [URL Detection] Using FALLBACK Render URL:", fallbackUrl);
    return fallbackUrl;
  }

  // PRIORITY 2: HARDCODED FOR PRODUCTION (ALWAYS use this for deployed frontend)
  // This is a safety net to ensure we never hit localhost in production
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname && !hostname.includes("localhost") && !hostname.includes("127.0.0.1")) {
      // We're on production (not localhost), but didn't match onrender above
      // Use hardcoded production backend
      const productionUrl = "https://cognifit-backend.onrender.com";
      console.log("✅ [URL Detection] Production hostname detected, using:", productionUrl);
      return productionUrl;
    }
  }

  // PRIORITY 3: LOCALHOST DEVELOPMENT
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    console.log("✅ [URL Detection] Localhost development detected");
    return "http://localhost:5000";
  }

  // PRIORITY 4: ENVIRONMENT VARIABLE (if set)
  if (process.env.REACT_APP_API_URL) {
    const url = process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '');
    console.log("✅ [URL Detection] Using REACT_APP_API_URL:", url);
    return url;
  }

  // DEFAULT FALLBACK
  const defaultUrl = "https://cognifit-backend.onrender.com";
  console.log("⚠️ [URL Detection] Using DEFAULT production URL:", defaultUrl);
  return defaultUrl;
};

// Get primary API URL
const primaryApiUrl = getApiUrl();

// 🔴 IMPORTANT: DO NOT INCLUDE LOCALHOST AS FALLBACK ON PRODUCTION!
// This prevents accidentally trying localhost when backend is sleeping
const isProduction = typeof window !== "undefined" && 
  !window.location.hostname.includes("localhost") && 
  !window.location.hostname.includes("127.0.0.1");

// Only include localhost as fallback in development
const BASE_URL_CANDIDATES = isProduction 
  ? [primaryApiUrl]  // PRODUCTION: Only use detected URL, no localhost fallback
  : [primaryApiUrl, "http://localhost:5000"]; // DEV: Try localhost if primary fails

// Create API URLs (with /api) for axios operations
const API_URL_CANDIDATES = BASE_URL_CANDIDATES.map(url => `${url}/api`);

console.log("🌍 [Axios] Environment:", isProduction ? "PRODUCTION" : "DEVELOPMENT");
console.log("📍 [Axios] Base URL candidates:", BASE_URL_CANDIDATES);
console.log("📍 [Axios] API URL candidates:", API_URL_CANDIDATES);

const API = axios.create({
  baseURL: `${primaryApiUrl}/api`,
  timeout: 30000, // ✅ 30 seconds for Render cold start
});

console.log("✅ [Axios] Created instance with baseURL:", `${primaryApiUrl}/api`);

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const errorCode = error.response?.data?.code;
    const message = error.response?.data?.message || error.message;
    
    // Log database connection errors
    if (status === 503 && errorCode === "DB_DISCONNECTED") {
      console.error("🚨 [Database Error]:", message);
      console.error("📋 To fix: Set MONGO_URI in Render environment variables");
    } else {
      console.error("❌ [Axios] API Error:", {
        url: error.config?.url,
        method: error.config?.method,
        status: status,
        message: message,
        code: error.code,
      });
    }
    
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const errorMessage = String(message || "").toLowerCase();
    const isAuthError =
      status === 401 &&
      (errorMessage.includes("token failed") ||
        errorMessage.includes("no token") ||
        errorMessage.includes("not authorized") ||
        errorMessage.includes("jwt") ||
        errorMessage.includes("expired"));

    if (isAuthError) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");

      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = `/login?reason=session-expired&next=${encodeURIComponent(window.location.pathname)}`;
      }

      return Promise.reject(error);
    }

    const isNetworkError =
      error.code === "ERR_NETWORK" ||
      error.code === "ECONNABORTED" ||
      !error.response;

    if (!isNetworkError) {
      return Promise.reject(error);
    }

    // 🔄 RETRY LOGIC: Instead of switching URLs, retry the same URL (wait for backend to wake)
    const retryCount = originalRequest._retryCount || 0;
    const MAX_RETRIES = 3;
    
    if (retryCount < MAX_RETRIES) {
      originalRequest._retryCount = retryCount + 1;
      const delayMs = 2000 * (retryCount + 1); // 2s, 4s, 6s delays
      
      console.log(`⏳ [Retry ${retryCount + 1}/${MAX_RETRIES}] Waiting ${delayMs}ms before retrying...`);
      console.log(`   URL: ${originalRequest.url}`);
      
      await sleep(delayMs);
      return API.request(originalRequest);
    }

    console.error("❌ [Axios] Max retries exceeded. Backend not responding.");
    return Promise.reject(error);
  }
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const wakeBaseUrl = async (baseUrl) => {
  // Try health check endpoint first
  try {
    await axios.get(`${baseUrl}/health`, { timeout: 12000 });
  } catch (err) {
    // Fallback to root endpoint
    await axios.get(`${baseUrl.replace(/\/api\/?$/, "")}`, { timeout: 12000 });
  }
};

export const warmupBackend = async () => {
  let lastError;

  for (const baseUrl of API_URL_CANDIDATES) {
    try {
      await wakeBaseUrl(baseUrl);
      API.defaults.baseURL = baseUrl;
      return true;
    } catch (err) {
      lastError = err;
      await sleep(1500);
    }
  }

  if (lastError) {
    throw lastError;
  }

  return false;
};

export const loginUser = (data) => API.post("/auth/login", data);
export const registerUser = (data) => API.post("/auth/register", data);
export const logoutUser = () => API.post("/auth/logout");
export const sendEmailOTP = (data) => API.post("/auth/send-email-otp", data);
export const verifyEmailOTP = (data) => API.post("/auth/verify-email-otp", data);
export const sendMobileOTP = (data) => API.post("/auth/send-mobile-otp", data);
export const verifyMobileOTP = (data) => API.post("/auth/verify-mobile-otp", data);
export const verifyCaptcha = (data) => API.post("/auth/verify-captcha", data);

// Forgot Password
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);
export const sendResetOTP = (data) => API.post("/auth/send-reset-otp", data);
export const verifyResetOTP = (data) => API.post("/auth/verify-reset-otp", data);
export const resetPassword = (data) => API.post("/auth/reset-password", data);

export const getJobs = () => API.get("/jobs");
export const getRecommendedJobs = () => API.get("/jobs/recommendations");
export const getJobById = (jobId) => API.get(`/jobs/${jobId}`);
export const createJob = (data) => API.post("/jobs/create", data);

export const applyToJob = (formData) =>
  API.post("/applications/apply", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
  });
export const getCandidateApplications = () => API.get("/applications/my");
export const getAllApplications = () => API.get("/applications/all");
export const updateApplicationStatus = (applicationId, status) =>
  API.put(`/applications/status/${applicationId}`, { status });
export const scheduleInterview = (applicationId, payload) =>
  API.put(`/applications/schedule/${applicationId}`, payload);

export const getJobCandidates = (jobId) => API.get(`/matching/job/${jobId}/candidates`);
export const getCandidateJobMatches = (candidateId) => API.get(`/matching/candidate/${candidateId}/jobs`);
export const analyzeResume = (data) => API.post("/matching/analyze-resume", data);
export const scoreCandidate = (data) => API.post("/matching/score", data);
export const getTopCandidates = () => API.get("/matching/top-candidates");
export const getAnalytics = () => API.get("/analytics");

export default API;