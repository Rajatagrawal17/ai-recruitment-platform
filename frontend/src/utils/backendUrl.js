const backendUrl = 
  import.meta.env.VITE_API_URL ||
  process.env.REACT_APP_API_URL || 
  'https://cognifit-backend.onrender.com'

console.log('Backend Base URL:', backendUrl)
export default backendUrl

export const getBackendUrl = () => {
  // If we're running on localhost, use localhost backend by default
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:5000";
    }
  }
  return backendUrl.trim().replace(/\/api\/?$/, "");
};

export const DEFAULT_BACKEND_URL = "https://cognifit-backend.onrender.com";
export const getApiBaseUrl = () => `${getBackendUrl()}/api`;