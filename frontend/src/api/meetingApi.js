import api from "./axiosInstance";

export const getMeetings = (params) => api.get("/meetings", { params });
export const getMeeting = (id) => api.get("/meetings/" + id);

export const createMeeting = (data) => api.post("/meetings", data);

export const updateMeeting = (id, data) => api.put("/meetings/" + id, data);
export const deleteMeeting = (id) => api.delete("/meetings/" + id);
export const updateMeetingStatus = (id, data) =>
  api.patch("/meetings/" + id + "/status", data);
