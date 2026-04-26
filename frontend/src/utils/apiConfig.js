import { getBackendUrl } from "./backendUrl";

export { getBackendUrl };

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
