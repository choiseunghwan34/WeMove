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
  chatKind: detail?.chatKind,
  title: detail?.title || "",
  message: detail?.message || "",
  sourceId: detail?.sourceId,
  createdAt: detail?.createdAt || new Date().toISOString(),
});

const getNotificationKey = (notification) => {
  if (notification.type === NOTIFICATION_TYPES.CHAT) {
    return `${notification.type}:${notification.chatKind || "GENERAL"}:${
      notification.sourceId || notification.title
    }`;
  }

  return notification.id;
};

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadKeys, setUnreadKeys] = useState(() => new Set());
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
    setUnreadKeys((current) => {
      const next = new Set(current);
      next.add(getNotificationKey(notification));
      return next;
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
    setUnreadKeys(new Set());
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  const togglePanel = useCallback(() => {
    setIsPanelOpen((current) => {
      if (!current) {
        setUnreadKeys(new Set());
      }
      return !current;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadKeys(new Set());
  }, []);

  const removeNotification = useCallback((notificationId) => {
    setNotifications((current) => {
      const target = current.find((item) => item.id === notificationId);
      if (target) {
        setUnreadKeys((keys) => {
          const next = new Set(keys);
          next.delete(getNotificationKey(target));
          return next;
        });
      }
      return current.filter((item) => item.id !== notificationId);
    });
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount: unreadKeys.size,
      isPanelOpen,
      pushNotification,
      openPanel,
      closePanel,
      togglePanel,
      clearAll,
      removeNotification,
    }),
    [
      notifications,
      unreadKeys,
      isPanelOpen,
      pushNotification,
      openPanel,
      closePanel,
      togglePanel,
      clearAll,
      removeNotification,
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
