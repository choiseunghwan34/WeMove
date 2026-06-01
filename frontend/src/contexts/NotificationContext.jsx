import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  NOTIFICATION_TYPES,
  WEMOVE_NOTIFICATION_EVENT,
} from "../utils/notificationEvents";

const MAX_NOTIFICATION_COUNT = 50;

const NotificationContext = createContext(null);

const createNotification = (detail) => ({
  id:
    detail?.id ||
    `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  type: detail?.type || NOTIFICATION_TYPES.INFO,
  title: detail?.title || "",
  message: detail?.message || "",
  sourceId: detail?.sourceId,
  createdAt: detail?.createdAt || new Date().toISOString(),
});

const getNotificationKey = (notification) => {
  if (notification.type === NOTIFICATION_TYPES.CHAT) {
    return `${notification.type}:${notification.sourceId || notification.title}`;
  }

  return notification.id;
};

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const pushNotification = useCallback((detail) => {
    const notification = createNotification(detail);

    if (!notification.title) {
      return;
    }

    setNotifications((current) => {
      const notificationKey = getNotificationKey(notification);
      const existingIndex = current.findIndex(
        (item) => getNotificationKey(item) === notificationKey,
      );

      if (existingIndex === -1) {
        return [notification, ...current].slice(0, MAX_NOTIFICATION_COUNT);
      }

      const next = [...current];
      next.splice(existingIndex, 1);
      return [notification, ...next].slice(0, MAX_NOTIFICATION_COUNT);
    });
  }, []);

  useEffect(() => {
    const handleNotification = (event) => {
      pushNotification(event.detail);
    };

    window.addEventListener(WEMOVE_NOTIFICATION_EVENT, handleNotification);
    return () => {
      window.removeEventListener(WEMOVE_NOTIFICATION_EVENT, handleNotification);
    };
  }, [pushNotification]);

  const openPanel = useCallback(() => {
    setIsPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  const togglePanel = useCallback(() => {
    setIsPanelOpen((current) => !current);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount: notifications.length,
      isPanelOpen,
      pushNotification,
      openPanel,
      closePanel,
      togglePanel,
      clearAll,
    }),
    [
      notifications,
      isPanelOpen,
      pushNotification,
      openPanel,
      closePanel,
      togglePanel,
      clearAll,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }

  return context;
}
