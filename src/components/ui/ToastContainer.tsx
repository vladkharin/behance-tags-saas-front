import React from "react";
import { useToast, type ToastType } from "../../context/ToastContext";
import { useTheme } from "../../context/ThemeContextInstance";

const icons: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠️",
  info: "ℹ️",
};

const bgColors: Record<ToastType, { light: string; dark: string; border: string }> = {
  success: {
    light: "bg-white text-gray-900 border-green-500/30",
    dark: "bg-[#111111] text-white border-green-500/30",
    border: "text-green-500",
  },
  error: {
    light: "bg-white text-gray-900 border-red-500/30",
    dark: "bg-[#111111] text-white border-red-500/30",
    border: "text-red-500",
  },
  warning: {
    light: "bg-white text-gray-900 border-amber-500/30",
    dark: "bg-[#111111] text-white border-amber-500/30",
    border: "text-amber-500",
  },
  info: {
    light: "bg-white text-gray-900 border-behance-blue/30",
    dark: "bg-[#111111] text-white border-behance-blue/30",
    border: "text-behance-blue",
  },
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4">
      {toasts.map((toast) => {
        const style = bgColors[toast.type];
        return (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-start gap-3.5 transition-all duration-300 transform translate-y-0 opacity-100 cursor-pointer hover:scale-[1.02] ${
              isDark ? style.dark : style.light
            } ${style.border}`}
          >
            <span className={`text-base leading-tight font-black ${style.border}`}>
              {icons[toast.type]}
            </span>
            <div className="flex-1 min-w-0">
              {toast.title && (
                <h4 className="text-[11px] font-black uppercase tracking-wider mb-0.5 opacity-90">
                  {toast.title}
                </h4>
              )}
              <p className="text-xs font-semibold leading-snug opacity-80 break-words">
                {toast.message}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              className="text-xs opacity-40 hover:opacity-100 transition-opacity p-0.5"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};
