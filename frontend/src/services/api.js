import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jobflow_token");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("jobflow_token");
      localStorage.removeItem("jobflow_username");
      if (
        window.location.pathname !== "/login" &&
        !window.location.pathname.startsWith("/forgot-password") &&
        !window.location.pathname.startsWith("/reset-password")
      ) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  },
);

export default api;
