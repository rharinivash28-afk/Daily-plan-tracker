import React, { createContext, useContext, useState, useCallback, useRef } from "react";

const ToastContext = createContext(null);

let counter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) { clearTimeout(timers.current[id]); delete timers.current[id]; }
  }, []);

  const push = useCallback((message, type = "info") => {
    const id = ++counter;
    setToasts((prev) => {
      const next = [...prev, { id, message, type }];
      return next.slice(-3); // keep max 3
    });
    timers.current[id] = setTimeout(() => dismiss(id), 2500);
  }, [dismiss]);

  // Stable toast API object.
  const api = useRef({});
  api.current.success = (m) => push(m, "success");
  api.current.error = (m) => push(m, "error");
  api.current.info = (m) => push(m, "info");

  return (
    <ToastContext.Provider value={{ toasts, dismiss, toast: api.current }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx.toast;
}

export function useToastState() {
  const ctx = useContext(ToastContext);
  return { toasts: ctx.toasts, dismiss: ctx.dismiss };
}
