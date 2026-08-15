import React from "react";
import { useToast } from "../../context/ToastContext";
import { useTheme } from "../../context/ThemeContextInstance";

export const ConfirmModal: React.FC = () => {
  const { confirmDialog, closeConfirm } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!confirmDialog) return null;

  const handleConfirm = () => {
    confirmDialog.onConfirm();
    closeConfirm();
  };

  const handleCancel = () => {
    if (confirmDialog.onCancel) {
      confirmDialog.onCancel();
    }
    closeConfirm();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`max-w-md w-full p-8 rounded-[2.5rem] border shadow-2xl transition-all ${
          isDark ? "bg-[#111111] border-white/10 text-white" : "bg-white border-behance-border text-behance-black"
        }`}
      >
        <h3 className="text-xl font-black uppercase tracking-tight mb-3">
          {confirmDialog.title}
        </h3>
        <p className="text-sm opacity-70 leading-relaxed font-medium mb-8">
          {confirmDialog.message}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider opacity-60 hover:opacity-100 transition-all"
          >
            {confirmDialog.cancelText || "Отмена"}
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-3 rounded-xl bg-behance-blue text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            {confirmDialog.confirmText || "Подтвердить"}
          </button>
        </div>
      </div>
    </div>
  );
};
