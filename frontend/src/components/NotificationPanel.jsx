import { useNotifications } from "../contexts/NotificationContext";
import styles from "../styles/Notification.module.css";

const TYPE_LABELS = {
  chat: "메시지",
  meetingRequest: "모임 신청",
  meetingApproved: "모임 승인",
  meetingRejected: "모임 거절",
  notice: "공지사항",
  info: "알림",
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
            <article key={notification.id} className={styles.item}>
              <span className={styles.type}>
                {TYPE_LABELS[notification.type] || TYPE_LABELS.info}
              </span>
              <strong>{notification.title}</strong>
              {notification.message ? <p>{notification.message}</p> : null}
              <time>{formatTime(notification.createdAt)}</time>
            </article>
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
