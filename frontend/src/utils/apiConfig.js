/**
 * Smart API URL detection for production and development
 */
export const getBackendUrl = () => {
  // 1. On Render production, use dynamic detection based on frontend hostname
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    
    if (hostname.includes("onrender.com")) {
      // Extract the base service name from frontend hostname
      // Example: cognifit-frontend-6coo.onrender.com → cognifit-backend-6coo.onrender.com
      // Or: cognifit-frontend.onrender.com → cognifit-backend.onrender.com
      
      if (hostname.includes("frontend")) {
        const backendHost = hostname.replace("frontend", "backend");
        const url = `https://${backendHost}`;
        console.log("✅ [API Config] Auto-detected Render backend URL:", url);
        return url;
      }
      
      // Fallback: if no "frontend" in hostname, assume backend is on same Render instance
      // This handles edge cases where hostname might be different
      const url = `https://${hostname.replace(/-.{4,}\.onrender\.com/, "-backend.onrender.com")}`;
      console.log("✅ [API Config] Fallback Render backend URL:", url);
      return url;
    }
  }

  // 2. Environment variable (build-time, less reliable on Render due to service naming)
  if (process.env.REACT_APP_API_URL) {
    const url = process.env.REACT_APP_API_URL;
    console.log("⚠️ [API Config] Using REACT_APP_API_URL (may be outdated):", url);
    return url;
  }

  // 3. Fallback to localhost for local development
  const url = "http://localhost:5000";
  console.log("💻 [API Config] Using localhost fallback:", url);
  return url;
};

/**
 * Build full API endpoint
 */
export const getApiEndpoint = (path) => {
  const baseUrl = getBackendUrl();
  // Ensure path starts with /
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const endpoint = `${baseUrl}/api${cleanPath}`;
  return endpoint;
};

// Log on initialization
if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    console.log("\n🚀 ===== COGNIFIT API CONFIGURATION =====");
    console.log("Backend Base URL:", getBackendUrl());
    console.log("Example endpoint:", getApiEndpoint("/auth/login"));
    console.log("Environment:", process.env.NODE_ENV);
    console.log("========================================\n");
  });
}
