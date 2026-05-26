import styles from "../styles/ToastViewport.module.css";

export default function ToastViewport({ toasts, onDismiss }) {
  if (!toasts.length) {
    return null;
  }

  return (
    <div className={styles.viewport} aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <article
          key={toast.id}
          className={`${styles.toast} ${styles[toast.tone] ?? ""}`.trim()}
        >
          <div className={styles.copy}>
            <strong>{toast.title}</strong>
            {toast.message ? <p>{toast.message}</p> : null}
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={() => onDismiss(toast.id)}
            aria-label="토스트 닫기"
          >
            ×
          </button>
        </article>
      ))}
    </div>
  );
}
