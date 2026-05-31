const backendUrl = process.env.REACT_APP_API_URL || "https://cognifit-backend.onrender.com";

export const getBackendUrl = () => {
  // If we're running on localhost, use localhost backend by default
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:5000";
    }
  }
  // Clean path suffix
  const envUrl = backendUrl.trim().replace(/\/api\/?$/, "");
  if (envUrl.includes("onrender.com") && !envUrl.includes("backend")) {
    return "https://cognifit-backend.onrender.com";
  }
  return envUrl;
};

export const DEFAULT_BACKEND_URL = "https://cognifit-backend.onrender.com";
export const getApiBaseUrl = () => `${getBackendUrl()}/api`;

export default backendUrl;