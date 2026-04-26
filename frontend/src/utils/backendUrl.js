export const DEFAULT_BACKEND_URL = "https://cognifit-backend.onrender.com";

export const getBackendUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL?.trim().replace(/\/api\/?$/, "");

  if (envUrl) {
    // Ignore misconfigured Render URLs that do not point to backend service.
    if (envUrl.includes("onrender.com") && !envUrl.includes("backend")) {
      return DEFAULT_BACKEND_URL;
    }
    return envUrl;
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;

    if (hostname.includes("onrender.com")) {
      // Use stable backend service URL to avoid wrong derived hostnames.
      return DEFAULT_BACKEND_URL;
    }

    if ((hostname === "localhost" || hostname === "127.0.0.1") && process.env.REACT_APP_USE_LOCAL_BACKEND === "true") {
      return "http://localhost:5000";
    }
  }

  return DEFAULT_BACKEND_URL;
};

export const getApiBaseUrl = () => `${getBackendUrl()}/api`;