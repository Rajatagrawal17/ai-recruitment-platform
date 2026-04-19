/**
 * Smart API URL detection for production and development
 */
export const getBackendUrl = () => {
  // 1. Try environment variable first (preferred)
  if (process.env.REACT_APP_API_URL) {
    const url = process.env.REACT_APP_API_URL;
    console.log("✅ [API Config] Using REACT_APP_API_URL env var:", url);
    return url;
  }

  // 2. If on Render production, detect backend URL
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    console.log("📍 [API Config] Current hostname:", hostname);
    
    if (hostname.includes("onrender.com")) {
      // Try to detect backend from frontend hostname
      const backendHost = hostname.replace("frontend", "backend");
      const url = `https://${backendHost}`;
      console.log("🔍 [API Config] Detected Render backend URL:", url);
      return url;
    }
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
