import React, { createContext, useContext, useState, useCallback } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  removeToast: (id: string) => void;
  confirm: (options: ConfirmDialogOptions) => void;
  confirmDialog: ConfirmDialogOptions | null;
  closeConfirm: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogOptions | null>(null);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", title?: string, duration: number = 3500) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast],
  );

  const confirm = useCallback((options: ConfirmDialogOptions) => {
    setConfirmDialog(options);
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmDialog(null);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, confirm, confirmDialog, closeConfirm }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
