"use client";
import { useEffect, useState } from "react";

export type ToastItem = { id: string; message: string; type: "success" | "error" | "info" };

let _addToast: ((msg: string, type?: ToastItem["type"]) => void) | null = null;

export function toast(msg: string, type: ToastItem["type"] = "info") {
  _addToast?.(msg, type);
}

export default function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    _addToast = (message, type = "info") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), type === "error" ? 6500 : 3500);
    };
    return () => {
      _addToast = null;
    };
  }, []);

  const icons: Record<string, string> = {
    success: "fa-circle-check",
    error: "fa-triangle-exclamation",
    info: "fa-circle-info",
  };

  return (
    <div id="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <i className={`fa-solid ${icons[t.type]}`} />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
