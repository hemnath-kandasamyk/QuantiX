import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((title: string, message?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div 
        aria-live="polite" 
        aria-atomic="true"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto ledger-card p-3.5 rounded-sm flex items-start gap-3 shadow-lg transform transition-all duration-300 ease-out translate-y-0 opacity-100 border-l-4"
            style={{
              borderLeftColor:
                toast.type === 'success'
                  ? 'var(--color-ledger-green)'
                  : toast.type === 'error'
                  ? 'var(--color-stamp-red)'
                  : 'var(--color-stamp-amber)',
            }}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[var(--color-ledger-green)]" />}
              {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-[var(--color-stamp-red)]" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-[var(--color-stamp-amber)]" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold font-mono-num uppercase tracking-wider text-[var(--color-text-ink)]">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-snug">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-text-ink)] p-1 rounded transition-colors"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
