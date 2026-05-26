import api from "./axiosInstance";

export const getChatRooms = () => api.get("/chat/rooms");

export const getChatMessages = (meetingId) =>
  api.get(`/meetings/${meetingId}/chat/messages`);

export const createChatMessage = (meetingId, content) =>
  api.post(`/meetings/${meetingId}/chat/messages`, { content });
