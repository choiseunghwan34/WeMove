import api from "./axiosInstance";
import { getAccessToken } from "../utils/authTokenStore";
import { parseUserFromAccessToken } from "../utils/jwtPayload";

export const getMeetings = (params) => api.get("/meetings", { params });
export const getMeeting = (id) => api.get("/meetings/" + id);

export const createMeeting = (data) => {
  const loginUser = parseUserFromAccessToken(getAccessToken());

  return api.post("/meetings", data, {
    headers: {
      "X-Member-Id": loginUser?.memberId,
    },
  });
};

export const updateMeeting = (id, data) => api.put("/meetings/" + id, data);
export const deleteMeeting = (id) => api.delete("/meetings/" + id);
export const updateMeetingStatus = (id, data) =>
  api.patch("/meetings/" + id + "/status", data);
