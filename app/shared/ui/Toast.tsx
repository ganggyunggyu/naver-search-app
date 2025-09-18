import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

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
    className="fixed z-50 top-4 left-1/2 transform -translate-x-1/2 pointer-events-none"
    aria-live="polite"
    aria-atomic="true"
  >
    <div className="w-full max-w-sm space-y-3 flex flex-col">
      {toasts.map((t) => (
        <ToastCard key={t.id} item={t} onClose={() => onClose(t.id)} />)
      )}
    </div>
  </div>
);

const ToastCard: React.FC<{ item: ToastItem; onClose: () => void }> = ({ item, onClose }) => {
  const iconColor =
    item.type === "success"
      ? "text-green-600 dark:text-green-400"
      : item.type === "error"
      ? "text-red-600 dark:text-red-400"
      : "text-gray-600 dark:text-gray-400";

  const borderColor =
    item.type === "success"
      ? "border-green-200 dark:border-green-800"
      : item.type === "error"
      ? "border-red-200 dark:border-red-800"
      : "border-gray-200 dark:border-gray-800";

  const bgColor =
    item.type === "success"
      ? "bg-green-50 dark:bg-green-950/20"
      : item.type === "error"
      ? "bg-red-50 dark:bg-red-950/20"
      : "bg-gray-50 dark:bg-gray-950/20";

  const IconComponent = item.type === "success" ? CheckCircle : item.type === "error" ? AlertTriangle : Info;

  return (
    <div
      role="status"
      className={`
        pointer-events-auto transform transition-all duration-300 ease-out
        bg-white dark:bg-black border rounded-xl shadow-lg hover:shadow-xl
        ${borderColor} animate-in slide-in-from-top
      `}
    >
      <div className="p-4 flex items-start gap-3">
        {/* 아이콘 */}
        <div className={`flex-shrink-0 ${iconColor}`}>
          <IconComponent size={20} />
        </div>

        {/* 메시지 */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-black dark:text-white leading-relaxed">
            {item.message}
          </p>
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      {/* 진행 표시줄 */}
      <div className={`h-1 rounded-b-xl ${bgColor} overflow-hidden`}>
        <div
          className={`h-full transition-all duration-100 ease-linear ${
            item.type === "success"
              ? "bg-green-500"
              : item.type === "error"
              ? "bg-red-500"
              : "bg-gray-500"
          }`}
          style={{
            width: `${Math.max(0, Math.min(100, ((item.expiresAt - Date.now()) / 25) * 4))}%`
          }}
        />
      </div>
    </div>
  );
};
