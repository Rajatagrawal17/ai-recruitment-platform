import React, { useEffect, useState } from "react";
import API from "../services/api";
import { getBackendUrl } from "../utils/apiConfig";

const DebugPage = () => {
  const [checks, setChecks] = useState({
    backendHealth: null,
    mongoConnection: null,
    authentication: null,
    applications: null,
    jobs: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDiagnostics = async () => {
      const results = { ...checks };

      // 1. Check backend health
      try {
        const res = await API.get("/health", { timeout: 5000 });
        results.backendHealth = {
          status: "✅ OK",
          details: res.data,
        };
      } catch (error) {
        results.backendHealth = {
          status: "❌ FAILED",
          error: error.message,
          details: `Cannot reach backend at ${getBackendUrl()}`,
        };
      }

      // 2. Check MongoDB connection
      try {
        const res = await API.get("/health", { timeout: 5000 });
        if (res.data?.database === "connected") {
          results.mongoConnection = {
            status: "✅ Connected",
            details: "MongoDB Atlas connected successfully",
          };
        } else if (res.data?.database === "disconnected") {
          results.mongoConnection = {
            status: "⚠️ Disconnected",
            details: "MONGO_URI not set in Render environment variables",
          };
        } else {
          results.mongoConnection = {
            status: "❓ Unknown",
            details: res.data?.database || "Unknown status",
          };
        }
      } catch (error) {
        results.mongoConnection = {
          status: "❌ FAILED",
          error: error.message,
        };
      }

      // 3. Check authentication
      const token = localStorage.getItem("token");
      results.authentication = {
        status: token ? "✅ Logged In" : "❌ Not Logged In",
        details: token ? "JWT token found" : "No token in localStorage",
      };

      // 4. Try to fetch applications
      try {
        const res = await API.get("/applications/my-applications", { timeout: 5000 });
        results.applications = {
          status: "✅ OK",
          details: `Found ${res.data?.applications?.length || 0} applications`,
        };
      } catch (error) {
        results.applications = {
          status: "❌ FAILED",
          error: error.message,
        };
      }

      // 5. Try to fetch jobs
      try {
        const res = await API.get("/jobs", { timeout: 5000 });
        results.jobs = {
          status: "✅ OK",
          details: `Found ${res.data?.jobs?.length || res.data?.count || 0} jobs`,
        };
      } catch (error) {
        results.jobs = {
          status: "❌ FAILED",
          error: error.message,
        };
      }

      setChecks(results);
      setLoading(false);
    };

    runDiagnostics();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto", fontFamily: "monospace" }}>
      <h1>🔧 Debug Diagnostics</h1>
      <p>This page helps diagnose connection and configuration issues.</p>

      <div style={{ marginTop: "20px" }}>
        <h2>Backend URL: {getBackendUrl()}</h2>
        <h2>Frontend URL: {typeof window !== "undefined" ? window.location.origin : "N/A"}</h2>
      </div>

      {loading ? (
        <div style={{ fontSize: "18px", marginTop: "20px" }}>⏳ Running diagnostics...</div>
      ) : (
        <div style={{ marginTop: "20px" }}>
          {Object.entries(checks).map(([key, check]) => (
            <div
              key={key}
              style={{
                marginBottom: "20px",
                padding: "15px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                backgroundColor: check.status.includes("✅") ? "#e8f5e9" : "#ffebee",
              }}
            >
              <div style={{ fontSize: "16px", fontWeight: "bold" }}>
                {key.replace(/([A-Z])/g, " $1").toUpperCase()}: {check.status}
              </div>
              <div style={{ marginTop: "8px", fontSize: "14px", color: "#666" }}>
                {check.details}
                {check.error && <div style={{ color: "red" }}>Error: {check.error}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "40px", padding: "15px", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
        <h3>🛠️ How to Fix Common Issues:</h3>
        <div style={{ fontSize: "14px", lineHeight: "1.8" }}>
          <p><strong>❌ Backend Health: FAILED</strong></p>
          <ul>
            <li>Check if Render backend is running: https://cognifit-backend.onrender.com/api/health</li>
            <li>Go to Render dashboard and manually deploy if needed</li>
            <li>Wait 5-10 minutes for cold start to complete</li>
          </ul>

          <p><strong>⚠️ MongoDB: Disconnected</strong></p>
          <ul>
            <li>Go to https://dashboard.render.com</li>
            <li>Click cognifit-backend service → Settings → Environment</li>
            <li>Add MONGO_URI with your MongoDB Atlas connection string</li>
            <li>Click "Manual Deploy" to restart the backend</li>
          </ul>

          <p><strong>❌ Not Logged In</strong></p>
          <ul>
            <li>Go to /login to create account or login</li>
            <li>Token will be stored in localStorage</li>
          </ul>

          <p><strong>❌ Applications/Jobs Failed</strong></p>
          <ul>
            <li>Usually caused by missing MONGO_URI</li>
            <li>Check MongoDB connection above</li>
            <li>App will show demo data as fallback</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DebugPage;
