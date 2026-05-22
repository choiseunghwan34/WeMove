import axios from "axios";
import { getAccessToken } from "../utils/authTokenStore";

const api = axios.create({
  baseURL: "http://localhost:8456/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization;
  }

  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data || config.params || "");
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status, response.data);
    return response;
  },
  (error) => {
    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
