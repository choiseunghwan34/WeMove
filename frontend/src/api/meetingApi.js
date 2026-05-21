import api from "./axiosInstance";
export const getMeetings = (p) => api.get("/meetings", { params: p });
export const getMeeting = (id) => api.get("/meetings/" + id);

export const createMeeting = (d) => {
    const loginUser = JSON.parse(localStorage.getItem("wemoveUser"));
    return api.post("/meetings", d,{
        headers: {
            "X-Member-Id": loginUser?.userId
        }
    })
}

export const updateMeeting = (id, d) => api.put("/meetings/" + id, d);
export const deleteMeeting = (id) => api.delete("/meetings/" + id);
export const updateMeetingStatus = (id, d) =>
  api.patch("/meetings/" + id + "/status", d);
