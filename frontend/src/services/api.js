import axios from "axios";

const API_URL_CANDIDATES = [
  process.env.REACT_APP_API_URL,
  "https://cognifit-backend.onrender.com/api",
  "http://localhost:5000/api",
].filter((url, index, arr) => url && arr.indexOf(url) === index);

const API = axios.create({
  baseURL: API_URL_CANDIDATES[0],
  timeout: 15000,
});

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
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isNetworkError =
      error.code === "ERR_NETWORK" ||
      error.code === "ECONNABORTED" ||
      !error.response;

    if (!isNetworkError) {
      return Promise.reject(error);
    }

    const currentBaseUrl = originalRequest.baseURL || API.defaults.baseURL;
    const currentIndex = Math.max(API_URL_CANDIDATES.indexOf(currentBaseUrl), 0);
    const nextIndex = currentIndex + 1;

    if (nextIndex >= API_URL_CANDIDATES.length) {
      return Promise.reject(error);
    }

    const nextBaseUrl = API_URL_CANDIDATES[nextIndex];
    originalRequest.baseURL = nextBaseUrl;
    API.defaults.baseURL = nextBaseUrl;

    return API.request(originalRequest);
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
export const sendEmailOTP = (data) => API.post("/auth/send-email-otp", data);
export const verifyEmailOTP = (data) => API.post("/auth/verify-email-otp", data);
export const sendMobileOTP = (data) => API.post("/auth/send-mobile-otp", data);
export const verifyMobileOTP = (data) => API.post("/auth/verify-mobile-otp", data);
export const verifyCaptcha = (data) => API.post("/auth/verify-captcha", data);

export const getJobs = () => API.get("/jobs");
export const getRecommendedJobs = () => API.get("/jobs/recommendations");
export const getJobById = (jobId) => API.get(`/jobs/${jobId}`);
export const createJob = (data) => API.post("/jobs/create", data);

export const applyToJob = (formData) =>
  API.post("/applications/apply", formData, {
    headers: { "Content-Type": "multipart/form-data" },
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