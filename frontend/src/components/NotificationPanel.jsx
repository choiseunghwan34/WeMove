import { useNotifications } from "../contexts/NotificationContext";
import {
  NOTIFICATION_TYPES,
  openNotificationTarget,
} from "../utils/notificationEvents";
import styles from "../styles/Notification.module.css";

const TYPE_LABELS = {
  [NOTIFICATION_TYPES.CHAT]: "메시지",
  [NOTIFICATION_TYPES.MEETING_REQUEST]: "모임 신청",
  [NOTIFICATION_TYPES.MEETING_APPROVED]: "모임 승인",
  [NOTIFICATION_TYPES.MEETING_REJECTED]: "모임 거절",
  [NOTIFICATION_TYPES.NOTICE]: "공지사항",
  [NOTIFICATION_TYPES.INFO]: "알림",
};

const formatTime = (value) => {
  if (!value) {
    return "";
  }

  return String(value).replace("T", " ").slice(0, 16);
};

export default function NotificationPanel() {
  const { notifications, isPanelOpen, closePanel, clearAll } = useNotifications();

  if (!isPanelOpen) {
    return null;
  }

  const handleNotificationClick = (notification) => {
    openNotificationTarget(notification);
    closePanel();
  };

  return (
    <aside className={styles.panel} aria-label="알림 목록">
      <div className={styles.panelHead}>
        <div>
          <strong>알림</strong>
          <span>{notifications.length}개</span>
        </div>
        <button type="button" onClick={closePanel} aria-label="알림 닫기">
          닫기
        </button>
      </div>

      <div className={styles.list}>
        {notifications.length ? (
          notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              className={styles.item}
              onClick={() => handleNotificationClick(notification)}
            >
              <span className={styles.type}>
                {TYPE_LABELS[notification.type] || TYPE_LABELS.info}
              </span>
              <strong>{notification.title}</strong>
              {notification.message ? <p>{notification.message}</p> : null}
              <time>{formatTime(notification.createdAt)}</time>
            </button>
          ))
        ) : (
          <p className={styles.empty}>아직 받은 알림이 없습니다.</p>
        )}
      </div>

      <div className={styles.panelFoot}>
        <button
          type="button"
          className={styles.clearButton}
          onClick={clearAll}
          disabled={!notifications.length}
        >
          모두 지우기
        </button>
      </div>
    </aside>
  );
}
