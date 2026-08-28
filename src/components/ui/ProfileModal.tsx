import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContextInstance";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
  userPlan: string;
  tagBalance: number;
  onNavigatePlans: () => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  email,
  userPlan,
  tagBalance,
  onNavigatePlans,
  onLogout,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all animate-in zoom-in-95 duration-200 ${
          isDark
            ? "bg-[#141418] border-white/10 text-white"
            : "bg-white border-zinc-200 text-zinc-900 shadow-zinc-300/50"
        }`}
      >
        {/* HEADER */}
        <div className="p-6 pb-4 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-behance-blue/10 text-behance-blue flex items-center justify-center text-xl font-bold">
              👤
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight">
                {t("profile.title")}
              </h2>
              <p className="text-xs opacity-60">
                {t("profile.subtitle")}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4">
          {/* USER EMAIL CARD */}
          <div className={`p-4 rounded-2xl border ${isDark ? "bg-white/5 border-white/5" : "bg-zinc-50 border-zinc-200"}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 block mb-1">
              {t("profile.emailLabel")}
            </span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold truncate">
                {email || "user@domcraft.digital"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-green-500/15 text-green-500 text-[10px] font-black uppercase font-mono border border-green-500/30">
                ✓ {t("profile.verifiedBadge")}
              </span>
            </div>
          </div>

          {/* PLAN & BALANCE GRID */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-4 rounded-2xl border ${isDark ? "bg-white/5 border-white/5" : "bg-zinc-50 border-zinc-200"}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 block mb-1">
                {t("profile.planLabel")}
              </span>
              <span className="text-sm font-black uppercase text-behance-blue tracking-wider">
                {userPlan}
              </span>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? "bg-white/5 border-white/5" : "bg-zinc-50 border-zinc-200"}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 block mb-1">
                {t("profile.fuelBalanceLabel")}
              </span>
              <span className="text-sm font-black font-mono text-green-500">
                {t("profile.tagsCount", { count: tagBalance })}
              </span>
            </div>
          </div>

          {/* SUBSCRIPTION STATUS CARD */}
          <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? "bg-blue-500/5 border-blue-500/20" : "bg-blue-50/50 border-blue-200"}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-behance-blue">
                {t("profile.subscriptionStatus")}
              </span>
              <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20">
                {t("profile.subscriptionActive")}
              </span>
            </div>
            <p className="text-[11px] opacity-75 leading-relaxed">
              {t("profile.subscriptionNote")}
            </p>
            <div className="pt-1">
              <button
                onClick={() => {
                  onClose();
                  onNavigatePlans();
                }}
                type="button"
                className="w-full py-2.5 rounded-xl bg-behance-blue hover:bg-behance-darkBlue text-white text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer"
              >
                {t("profile.upgradeBtn")}
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 pt-3 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between gap-3">
          <button
            onClick={onLogout}
            type="button"
            className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 text-xs font-bold transition-all cursor-pointer"
          >
            {t("profile.logoutBtn")}
          </button>

          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2.5 rounded-xl bg-zinc-200 dark:bg-white/10 hover:bg-zinc-300 dark:hover:bg-white/20 text-xs font-bold transition-all cursor-pointer"
          >
            {t("profile.closeBtn")}
          </button>
        </div>
      </div>
    </div>
  );
};
