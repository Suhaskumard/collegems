import React, { createContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextProps {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
  };
}

export const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toastMethods = {
    success: (msg: string) => addToast("success", msg),
    error: (msg: string) => addToast("error", msg),
    info: (msg: string) => addToast("info", msg),
    warning: (msg: string) => addToast("warning", msg),
  };

  return (
    <ToastContext.Provider value={{ toast: toastMethods }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => {
          const isError = toast.type === "error";
          const isSuccess = toast.type === "success";
          const isWarning = toast.type === "warning";
          const isInfo = toast.type === "info";

          const bgClass = isError
            ? "bg-red-50 dark:bg-red-900/90 border-red-200 text-red-800 dark:text-red-100"
            : isSuccess
            ? "bg-green-50 dark:bg-green-900/90 border-green-200 text-green-800 dark:text-green-100"
            : isWarning
            ? "bg-amber-50 dark:bg-amber-900/90 border-amber-200 text-amber-800 dark:text-amber-100"
            : "bg-blue-50 dark:bg-blue-900/90 border-blue-200 text-blue-800 dark:text-blue-100";

          return (
            <div
              key={toast.id}
              className={`flex items-center gap-3 p-4 min-w-[300px] border rounded-xl shadow-lg transition-all animate-in slide-in-from-bottom-5 fade-in duration-300 ${bgClass}`}
            >
              <div className="shrink-0">
                {isSuccess && <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />}
                {isError && <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                {isInfo && <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
              </div>
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
