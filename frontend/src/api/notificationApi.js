import api from "./axiosInstance";

export const getNotifications = () => api.get("/notifications");

export const getUnreadNotificationCount = () =>
  api.get("/notifications/unread-count");

export const markNotificationsReadAll = () =>
  api.patch("/notifications/read-all");

export const deleteNotification = (notificationId) =>
  api.delete(`/notifications/${notificationId}`);

export const deleteNotifications = () => api.delete("/notifications");
