import api from "./axiosInstance";

export const signup = (data) => api.post("/auth/signup", data);
export const login = (data) => api.post("/auth/login", data);
export const refreshSession = () => api.post("/auth/refresh");
export const logout = () => api.post("/auth/logout");
export const checkSessionStatus = () => api.get("/auth/session-status");
export const sendEmailVerification = (email) =>
  api.post("/auth/email/send", { email });
