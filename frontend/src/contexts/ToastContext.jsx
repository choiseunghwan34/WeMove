import { createContext, useCallback, useContext, useMemo, useState } from "react";
import ToastViewport from "../components/ToastViewport";

const ToastContext = createContext(null);

let nextToastId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, message = "", tone = "info", duration = 2600 }) => {
      const id = nextToastId;
      nextToastId += 1;

      setToasts((current) => [...current, { id, title, message, tone }]);

      if (duration > 0) {
        window.setTimeout(() => dismissToast(id), duration);
      }

      return id;
    },
    [dismissToast],
  );

  const value = useMemo(
    () => ({
      showToast,
      success: (title, message) =>
        showToast({ title, message, tone: "success" }),
      error: (title, message) => showToast({ title, message, tone: "error" }),
      info: (title, message) => showToast({ title, message, tone: "info" }),
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
