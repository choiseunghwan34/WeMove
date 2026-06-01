export const WEMOVE_NOTIFICATION_EVENT = "wemove:notification";

export const NOTIFICATION_TYPES = {
  CHAT: "chat",
  MEETING_REQUEST: "meetingRequest",
  MEETING_APPROVED: "meetingApproved",
  MEETING_REJECTED: "meetingRejected",
  NOTICE: "notice",
  INFO: "info",
};

export const publishNotification = ({
  type = NOTIFICATION_TYPES.INFO,
  title,
  message = "",
  createdAt = new Date().toISOString(),
}) => {
  if (typeof window === "undefined" || !title) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(WEMOVE_NOTIFICATION_EVENT, {
      detail: {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type,
        title,
        message,
        createdAt,
      },
    }),
  );
};
