import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8090/api";
export const UPLOADS_BASE = API_BASE.replace(/\/api$/, "");
export const getPhotoUrl = (filename: string) => `${UPLOADS_BASE}/uploads/${filename}`;

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
