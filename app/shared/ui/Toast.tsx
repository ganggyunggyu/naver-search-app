import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = "success" | "error" | "info";

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
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
  <div aria-live="polite" aria-atomic="true">
    <div>
      {toasts.map((t) => (
        <ToastCard key={t.id} item={t} onClose={() => onClose(t.id)} />)
      )}
    </div>
  </div>
);

const ToastCard: React.FC<{ item: ToastItem; onClose: () => void }> = ({ item, onClose }) => {
  const IconComponent = item.type === "success" ? CheckCircle : item.type === "error" ? AlertTriangle : Info;

  return (
    <div role="status">
      <div>
        <div>
          <IconComponent size={20} />
        </div>
        <div>
          <p>{item.message}</p>
        </div>
        <button onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
      </div>
      <div>
        <div
          style={{
            width: `${Math.max(0, Math.min(100, ((item.expiresAt - Date.now()) / 25) * 4))}%`
          }}
        />
      </div>
    </div>
  );
};
