import api from "./axiosInstance";
export const signup = (d) => api.post("/auth/signup", d);
export const login = (d) => api.post("/auth/login", d);
