import React, { useEffect, useState } from "react";
import API from "../services/api";

const SystemDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState({
    backendUrl: "Detecting...",
    backendHealth: "Checking...",
    mongoStatus: "Checking...",
    apiTest: "Checking...",
    errors: [],
  });

  useEffect(() => {
    const runDiagnostics = async () => {
      const errors = [];
      const results = { backendUrl: "", backendHealth: "", mongoStatus: "", apiTest: "", errors: [] };

      try {
        // Get backend URL from API service
        results.backendUrl = API.defaults.baseURL || "Unknown";
        console.log("🔗 Backend URL:", results.backendUrl);

        // Test health endpoint
        try {
          const healthRes = await fetch(`${results.backendUrl}/health`, { timeout: 5000 });
          const healthData = await healthRes.json();
          console.log("📊 Health Response:", healthData);
          results.backendHealth = healthData.status || "Unknown";
          results.mongoStatus = healthData.database || "Unknown";
        } catch (err) {
          console.error("❌ Health check failed:", err.message);
          errors.push(`Health check failed: ${err.message}`);
          results.backendHealth = "FAILED";
          results.mongoStatus = "FAILED";
        }

        // Test API call
        try {
          const jobsRes = await API.get("/jobs");
          console.log("📋 Jobs API Response:", jobsRes.data);
          results.apiTest = `Success - ${jobsRes.data.jobs?.length || 0} jobs`;
        } catch (err) {
          console.error("❌ Jobs API failed:", err);
          errors.push(`Jobs API failed: ${err.message}`);
          results.apiTest = `FAILED: ${err.message}`;
        }

        setDiagnostics({ ...results, errors });
      } catch (err) {
        console.error("Diagnostic error:", err);
        errors.push(`Diagnostic error: ${err.message}`);
        setDiagnostics({ ...results, errors });
      }
    };

    runDiagnostics();
  }, []);

  return (
    <div style={{
      padding: "20px",
      maxWidth: "1000px",
      margin: "0 auto",
      fontFamily: "monospace",
      fontSize: "12px",
      lineHeight: "1.6",
      backgroundColor: "#f5f5f5",
      borderRadius: "8px",
      marginTop: "20px",
    }}>
      <h2>🔧 System Diagnostics</h2>
      
      <div style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "10px" }}>
          <strong>Backend URL:</strong> {diagnostics.backendUrl}
        </div>
        <div style={{ marginBottom: "10px" }}>
          <strong>Backend Health:</strong> {diagnostics.backendHealth}
        </div>
        <div style={{ marginBottom: "10px" }}>
          <strong>MongoDB Status:</strong> {diagnostics.mongoStatus}
        </div>
        <div style={{ marginBottom: "10px" }}>
          <strong>API Test:</strong> {diagnostics.apiTest}
        </div>
      </div>

      {diagnostics.errors.length > 0 && (
        <div style={{ backgroundColor: "#ffe0e0", padding: "10px", borderRadius: "4px", marginTop: "20px" }}>
          <h3>❌ Errors Found:</h3>
          <ul>
            {diagnostics.errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ backgroundColor: "#e0f0ff", padding: "10px", borderRadius: "4px", marginTop: "20px" }}>
        <h3>📋 Debugging Tips:</h3>
        <ol>
          <li>Open browser console (F12)</li>
          <li>Check for any red errors in console</li>
          <li>Look at Network tab for API requests</li>
          <li>Check if backend is responding: {diagnostics.backendUrl}/health</li>
          <li>Verify MONGO_URI is set in Render</li>
        </ol>
      </div>
    </div>
  );
};

export default SystemDiagnostics;
