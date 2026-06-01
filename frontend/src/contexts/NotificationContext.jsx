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
  createdAt: detail?.createdAt || new Date().toISOString(),
});

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const pushNotification = useCallback((detail) => {
    const notification = createNotification(detail);

    if (!notification.title) {
      return;
    }

    setNotifications((current) =>
      [notification, ...current].slice(0, MAX_NOTIFICATION_COUNT)
    );
    setUnreadCount((current) => current + 1);
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
    setUnreadCount(0);
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  const togglePanel = useCallback(() => {
    setIsPanelOpen((current) => !current);
    setUnreadCount(0);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isPanelOpen,
      pushNotification,
      openPanel,
      closePanel,
      togglePanel,
      clearAll,
    }),
    [
      notifications,
      unreadCount,
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
