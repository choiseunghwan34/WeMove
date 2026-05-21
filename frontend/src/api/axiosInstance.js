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

  return config;
});

export default api;
