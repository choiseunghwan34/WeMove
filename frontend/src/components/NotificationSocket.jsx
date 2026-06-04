import { useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  NOTIFICATION_TYPES,
  publishAccountSuspend,
  publishNotification,
} from "../utils/notificationEvents";
import { getAccessToken } from "../utils/authTokenStore";

const SOCKET_URL = "ws://localhost:8456/ws/notifications";

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

    const socket = new WebSocket(
      `${SOCKET_URL}?token=${encodeURIComponent(token)}`,
    );

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
          });
          return;
        }

        publishNotification({
          type: payload.type || NOTIFICATION_TYPES.INFO,
          title: payload.title,
          message: payload.message || "",
          sourceId: payload.sourceId,
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
