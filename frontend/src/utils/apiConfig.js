/**
 * Smart API URL detection for production and development
 */
export const getBackendUrl = () => {
  // 1. Try environment variable first
  if (process.env.REACT_APP_API_URL) {
    console.log("✓ Using REACT_APP_API_URL:", process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }

  // 2. If on browser, detect Render production
  if (typeof window !== "undefined" && window.location.hostname.includes("onrender.com")) {
    const backendHost = window.location.hostname.replace("frontend", "backend");
    const url = `https://${backendHost}`;
    console.log("✓ Using Render detected URL:", url);
    return url;
  }

  // 3. Fallback to localhost
  console.log("✓ Using localhost fallback");
  return "http://localhost:5000";
};

/**
 * Build full API endpoint
 */
export const getApiEndpoint = (path) => {
  const baseUrl = getBackendUrl();
  // Remove leading slash from path if present
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}/api${cleanPath}`;
};

console.log("🔧 API Config loaded. Backend URL:", getBackendUrl());
