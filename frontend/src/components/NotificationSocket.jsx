import { useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  NOTIFICATION_TYPES,
  publishAccountSuspend,
  publishNotification,
} from "../utils/notificationEvents";
import { getAccessToken } from "../utils/authTokenStore";
import { buildWsUrl } from "../config/env";

export default function NotificationSocket() {
  const { isAuthenticated, accessToken } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    const token = accessToken || getAccessToken();

    if (!isAuthenticated || !token) {
      socketRef.current?.close();
      socketRef.current = null;
      return undefined;
    }

    const socket = new WebSocket(buildWsUrl("/notifications", { token }));

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (
          payload.type === NOTIFICATION_TYPES.ACCOUNT_SUSPEND ||
          payload.forceLogout
        ) {
          publishAccountSuspend({
            title: payload.title || "계정 정지 안내",
            message: payload.message || "",
            suspendedUntil: payload.suspendedUntil,
            suspendHours: payload.suspendHours,
          });
          return;
        }

        publishNotification({
          id: payload.id || payload.notificationId,
          notificationId: payload.notificationId || payload.id,
          type: payload.type || NOTIFICATION_TYPES.INFO,
          title: payload.title,
          message: payload.message || "",
          targetType: payload.targetType,
          targetId: payload.targetId,
          sourceId: payload.sourceId,
          isRead: payload.isRead,
          createdAt: payload.createdAt,
          suspendedUntil: payload.suspendedUntil,
          suspendHours: payload.suspendHours,
        });
      } catch {
        // Ignore malformed notification payloads.
      }
    };

    socket.onclose = () => {
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };

    socketRef.current = socket;

    return () => {
      socket.close();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [accessToken, isAuthenticated]);

  return null;
}
