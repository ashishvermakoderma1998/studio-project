import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md text-sm ${
                t.type === 'success'
                  ? 'bg-neutral-900/95 border-amber-500/40 text-neutral-100 shadow-amber-950/20'
                  : t.type === 'error'
                  ? 'bg-neutral-900/95 border-red-500/40 text-neutral-100 shadow-red-950/20'
                  : 'bg-neutral-900/95 border-neutral-700 text-neutral-100'
              }`}
            >
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />}
              
              <div className="flex-1 font-medium">{t.message}</div>
              
              <button
                onClick={() => removeToast(t.id)}
                className="text-neutral-400 hover:text-white transition-colors p-0.5 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
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
