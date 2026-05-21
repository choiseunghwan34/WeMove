import api from "./axiosInstance";

export const signup = (data) => api.post("/auth/signup", data);
export const login = (data) => api.post("/auth/login", data);
export const getMe = () => api.get("/auth/me");
export const refreshSession = () => api.post("/auth/refresh");
export const logout = () => api.post("/auth/logout");
