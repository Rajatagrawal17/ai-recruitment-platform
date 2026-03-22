import axios from "axios";

const API_URL_CANDIDATES = [
  process.env.REACT_APP_API_URL,
  "https://cognifit-backend.onrender.com/api",
  "https://ai-recruitment-backend.onrender.com/api",
  "http://localhost:5000/api",
].filter((url, index, arr) => url && arr.indexOf(url) === index);

const API = axios.create({
  baseURL: API_URL_CANDIDATES[0],
  timeout: 45000,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isNetworkError =
      error.code === "ERR_NETWORK" ||
      error.code === "ECONNABORTED" ||
      !error.response;

    if (!isNetworkError) {
      return Promise.reject(error);
    }

    const currentBaseUrl = originalRequest.baseURL || API.defaults.baseURL;
    const currentIndex = Math.max(API_URL_CANDIDATES.indexOf(currentBaseUrl), 0);
    const nextIndex = currentIndex + 1;

    if (nextIndex >= API_URL_CANDIDATES.length) {
      return Promise.reject(error);
    }

    const nextBaseUrl = API_URL_CANDIDATES[nextIndex];
    originalRequest.baseURL = nextBaseUrl;
    API.defaults.baseURL = nextBaseUrl;

    return API.request(originalRequest);
  }
);

export default API;