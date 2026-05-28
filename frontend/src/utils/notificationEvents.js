export const WEMOVE_NOTIFICATION_EVENT = "wemove:notification";

export const publishNotification = ({
  type = "info",
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
