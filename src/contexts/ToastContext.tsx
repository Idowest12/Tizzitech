import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Automatically dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />;
      case "error":
        return <XCircle className="h-5 w-5 text-rose-400 shrink-0" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-400 shrink-0" />;
    }
  };

  const getColorClasses = (type: ToastType) => {
    switch (type) {
      case "success":
        return "bg-neutral-950/95 border-emerald-500/30 text-neutral-200 shadow-emerald-950/20";
      case "error":
        return "bg-neutral-950/95 border-rose-500/30 text-neutral-200 shadow-rose-950/20";
      case "warning":
        return "bg-neutral-950/95 border-amber-500/30 text-neutral-200 shadow-amber-950/20";
      case "info":
        return "bg-neutral-950/95 border-blue-500/30 text-neutral-200 shadow-blue-950/20";
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container floating at the top-right */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md ${getColorClasses(
                toast.type
              )}`}
            >
              {getIcon(toast.type)}
              <div className="flex-1 text-sm font-medium leading-tight pt-0.5">
                {toast.message}
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-neutral-500 hover:text-neutral-300 p-0.5 rounded-full hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
