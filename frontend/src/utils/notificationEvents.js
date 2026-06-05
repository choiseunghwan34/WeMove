export const WEMOVE_NOTIFICATION_EVENT = "wemove:notification";
export const WEMOVE_NOTIFICATION_OPEN_EVENT = "wemove:notification-open";
export const WEMOVE_ACCOUNT_SUSPEND_EVENT = "wemove:account-suspend";

export const NOTIFICATION_TYPES = {
  CHAT: "chat",
  MEETING_REQUEST: "meetingRequest",
  MEETING_APPROVED: "meetingApproved",
  MEETING_REJECTED: "meetingRejected",
  NOTICE: "notice",
  INFO: "info",
  ACCOUNT_WARNING: "accountWarning",
  ACCOUNT_SUSPEND: "accountSuspend",
};

export const openNotificationTarget = (notification) => {
  if (typeof window === "undefined" || !notification) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(WEMOVE_NOTIFICATION_OPEN_EVENT, {
      detail: notification,
    }),
  );
};

export const publishAccountSuspend = ({
  title = "계정 정지 안내",
  message = "",
  suspendedUntil,
  suspendHours,
}) => {
  if (typeof window === "undefined" || !message) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(WEMOVE_ACCOUNT_SUSPEND_EVENT, {
      detail: { title, message, suspendedUntil, suspendHours },
    }),
  );
};

export const publishNotification = ({
  type = NOTIFICATION_TYPES.INFO,
  chatKind,
  title,
  message = "",
  sourceId,
  createdAt = new Date().toISOString(),
  forceLogout,
  suspendedUntil,
  suspendHours,
}) => {
  if (typeof window === "undefined" || !title) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(WEMOVE_NOTIFICATION_EVENT, {
      detail: {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type,
        chatKind,
        title,
        message,
        sourceId,
        createdAt,
        forceLogout,
        suspendedUntil,
        suspendHours,
      },
    }),
  );
};
