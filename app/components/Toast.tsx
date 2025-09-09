import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type ToastType = "success" | "error" | "info";

export interface ToastOptions {
  type?: ToastType;
  duration?: number; // ms
}

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  expiresAt: number;
}

interface ToastContextValue {
  show: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timers.current.get(id);
    if (t) {
      window.clearTimeout(t);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback((message: string, options?: ToastOptions) => {
    const id = Math.random().toString(36).slice(2);
    const type: ToastType = options?.type ?? "info";
    const duration = options?.duration ?? 2500;
    const expiresAt = Date.now() + duration;
    const toast: ToastItem = { id, message, type, expiresAt };
    setToasts((prev) => [...prev, toast]);
    const timer = window.setTimeout(() => remove(id), duration);
    timers.current.set(id, timer);
  }, [remove]);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onClose={remove} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

const ToastViewport: React.FC<{ toasts: ToastItem[]; onClose: (id: string) => void }> = ({ toasts, onClose }) => (
  <div
    className="fixed z-50 inset-x-0 bottom-4 sm:bottom-6 pointer-events-none flex justify-center"
    aria-live="polite"
    aria-atomic="true"
  >
    <div className="w-full sm:max-w-sm space-y-2 flex flex-col items-center">
      {toasts.map((t) => (
        <ToastCard key={t.id} item={t} onClose={() => onClose(t.id)} />)
      )}
    </div>
  </div>
);

const ToastCard: React.FC<{ item: ToastItem; onClose: () => void }> = ({ item, onClose }) => {
  const color =
    item.type === "success"
      ? "bg-green-600"
      : item.type === "error"
      ? "bg-red-600"
      : "bg-gray-800";

  const icon = item.type === "success" ? "✅" : item.type === "error" ? "⚠️" : "ℹ️";

  return (
    <div
      role="status"
      className="pointer-events-auto overflow-hidden rounded-lg shadow-lg ring-1 ring-black/10 bg-white dark:bg-gray-900"
    >
      <div className="p-3 pl-0 flex items-start">
        <div className={`${color} text-white flex items-center justify-center w-10 h-10 shrink-0`}>{icon}</div>
        <div className="px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 flex-1">
          {item.message}
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <div className="h-1 bg-gray-200 dark:bg-gray-800">
        <div
          className="h-full bg-gray-400/40"
          style={{ width: `${Math.max(0, (item.expiresAt - Date.now()) / 25)}%` }}
        />
      </div>
    </div>
  );
};
