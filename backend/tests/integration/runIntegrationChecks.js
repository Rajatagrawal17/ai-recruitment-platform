require("dotenv").config();

const axios = require("axios");

const BASE_URL =
  process.env.INTEGRATION_BASE_URL ||
  process.env.API_BASE_URL ||
  "https://cognifit-backend.onrender.com/api";
const CAND_EMAIL = process.env.INTEGRATION_CANDIDATE_EMAIL || "arjun.sharma@demo.com";
const CAND_PASSWORD = process.env.INTEGRATION_CANDIDATE_PASSWORD || "candidate123";
const REC_EMAIL = process.env.INTEGRATION_RECRUITER_EMAIL || "recruiter.google@hireai.com";
const REC_PASSWORD = process.env.INTEGRATION_RECRUITER_PASSWORD || "recruiter123";

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
});

const ensure = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const login = async (email, password) => {
  const response = await client.post("/auth/login", { email, password });
  ensure(response.data?.token, `Missing token for ${email}`);
  return response.data.token;
};

const run = async () => {
  console.log(`Running integration checks against: ${BASE_URL}`);

  const candidateToken = await login(CAND_EMAIL, CAND_PASSWORD);
  const recruiterToken = await login(REC_EMAIL, REC_PASSWORD);

  const candidateHeaders = { Authorization: `Bearer ${candidateToken}` };
  const recruiterHeaders = { Authorization: `Bearer ${recruiterToken}` };

  const recommendations = await client.get("/jobs/recommendations", {
    headers: candidateHeaders,
  });
  ensure(Array.isArray(recommendations.data?.recommendations), "Recommendations payload missing recommendations array");

  const candidateApps = await client.get("/applications/my", {
    headers: candidateHeaders,
  });
  ensure(Array.isArray(candidateApps.data?.applications), "Candidate applications payload invalid");

  const analytics = await client.get("/analytics", {
    headers: recruiterHeaders,
  });
  ensure(typeof analytics.data?.analytics?.totalApplications === "number", "Analytics payload missing totalApplications");

  if (candidateApps.data.applications.length > 0) {
    const app = candidateApps.data.applications[0];
    ensure(app.matchExplanation, "Application missing matchExplanation");
    ensure(app.resumeFeedback, "Application missing resumeFeedback");
  }

  console.log("All integration checks passed.");
};

run().catch((error) => {
  const apiMessage = error?.response?.data?.message;
  const status = error?.response?.status;
  console.error("Integration checks failed:", apiMessage || error.message || "Unknown error");
  if (status) {
    console.error("HTTP status:", status);
  }
  process.exitCode = 1;
});
