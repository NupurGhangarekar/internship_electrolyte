import axios from "axios";

const getDefaultApiUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL;
  if (configuredUrl) return configuredUrl;
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:5000";
};

export const API_URL = getDefaultApiUrl();

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error.response?.data || { message: "Network error" })
);

export default api;
