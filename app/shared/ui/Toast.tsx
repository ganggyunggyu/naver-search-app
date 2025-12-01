import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

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

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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

  const show = useCallback(
    (message: string, options?: ToastOptions) => {
      const id = Math.random().toString(36).slice(2);
      const type: ToastType = options?.type ?? 'info';
      const duration = options?.duration ?? 2500;
      const expiresAt = Date.now() + duration;
      const toast: ToastItem = { id, message, type, expiresAt };
      setToasts((prev) => [...prev, toast]);
      const timer = window.setTimeout(() => remove(id), duration);
      timers.current.set(id, timer);
    },
    [remove]
  );

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
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

const TOAST_STYLES: Record<
  ToastType,
  { bg: string; icon: string; progress: string }
> = {
  success: {
    bg: 'bg-[var(--color-success-soft)] border-[var(--color-success)]/30',
    icon: 'text-[var(--color-success)]',
    progress: 'bg-[var(--color-success)]',
  },
  error: {
    bg: 'bg-[var(--color-error-soft)] border-[var(--color-error)]/30',
    icon: 'text-[var(--color-error)]',
    progress: 'bg-[var(--color-error)]',
  },
  info: {
    bg: 'bg-[var(--color-info-soft)] border-[var(--color-info)]/30',
    icon: 'text-[var(--color-info)]',
    progress: 'bg-[var(--color-info)]',
  },
};

const ToastViewport: React.FC<{
  toasts: ToastItem[];
  onClose: (id: string) => void;
}> = ({ toasts, onClose }) => (
  <aside
    aria-live="polite"
    aria-atomic="true"
    aria-label="알림"
    className="fixed bottom-4 sm:bottom-auto sm:top-20 left-1/2 -translate-x-1/2 z-[var(--z-toast)] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none"
  >
    {toasts.map((t) => (
      <ToastCard key={t.id} item={t} onClose={() => onClose(t.id)} />
    ))}
  </aside>
);

const ToastCard: React.FC<{ item: ToastItem; onClose: () => void }> = ({
  item,
  onClose,
}) => {
  const IconComponent =
    item.type === 'success'
      ? CheckCircle
      : item.type === 'error'
        ? AlertTriangle
        : Info;

  const styles = TOAST_STYLES[item.type];

  return (
    <output
      role="status"
      className={`pointer-events-auto animate-toast-in rounded-xl border backdrop-blur-sm shadow-[var(--shadow-lg)] overflow-hidden ${styles.bg}`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <span className={`flex-shrink-0 ${styles.icon}`}>
          <IconComponent size={20} />
        </span>
        <p className="flex-1 text-sm font-medium text-[var(--color-text-primary)]">
          {item.message}
        </p>
        <button
          onClick={onClose}
          aria-label="닫기"
          className="flex-shrink-0 p-1 rounded-md text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-hover)] transition-colors"
        >
          <X size={16} />
        </button>
      </div>
      <div className="h-1 bg-[var(--color-border)]">
        <div
          className={`h-full transition-all duration-100 ease-linear ${styles.progress}`}
          style={{
            width: `${Math.max(0, Math.min(100, ((item.expiresAt - Date.now()) / 25) * 4))}%`,
          }}
        />
      </div>
    </output>
  );
};
