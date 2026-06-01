import api from "./axiosInstance";

export const getMeetings = (params) => api.get("/meetings", { params });
export const getMeeting = (id) => api.get("/meetings/" + id);
export const getMainMeetings = (params ={}) =>
{
    return api.get("/meetings/main", {
        params: {
            ...params,
            category: params.category || "전체",
        } });
}

export const getTopRegions = () => api.get("/meetings/top-regions");
export const createMeeting = (formData) => api.post("/meetings", formData);

export const updateMeeting = (id, formData) => api.put("/meetings/" + id, formData);
export const deleteMeeting = (id) => api.delete("/meetings/" + id);
export const updateMeetingStatus = (id, data) =>
  api.patch("/meetings/" + id + "/status", data);
