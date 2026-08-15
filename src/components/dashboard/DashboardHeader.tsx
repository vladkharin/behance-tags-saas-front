import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContextInstance";
import type { BehanceProject } from "../../types/analytics.types";

interface DashboardHeaderProps {
  project: BehanceProject | null;
  tagBalance: number;
  hasEnoughBalance: boolean;
  isDemoMode: boolean;
  isBusy: boolean;
  actionLoading: boolean;
  status: string;
  onRefreshRankings: () => void;
  onToggleSchedule: () => void;
  onNavigatePricing: () => void;
  onOpenMobileMenu: () => void;
  onOpenVideoTutorial?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  project,
  tagBalance,
  hasEnoughBalance,
  isDemoMode,
  isBusy,
  actionLoading,
  status,
  onRefreshRankings,
  onToggleSchedule,
  onNavigatePricing,
  onOpenMobileMenu,
  onOpenVideoTutorial,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-behance-border dark:border-white/5 pb-8 md:pb-10 gap-6">
      {/* LEFT: TITLE, SOURCE, ROBOT, BALANCE */}
      <div className="space-y-3 max-w-2xl">
        <div className="flex items-center gap-3">
          {/* Mobile menu trigger */}
          <button
            onClick={onOpenMobileMenu}
            type="button"
            className="lg:hidden p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-sm font-bold flex items-center justify-center cursor-pointer"
            aria-label="Open sidebar"
          >
            ☰
          </button>

          <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-[0.9] truncate">
            {project?.title || "Untitled Project"}
          </h2>

          {isDemoMode && (
            <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest animate-pulse shrink-0">
              {t("dashboard.demo.badge")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {project?.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-black text-behance-blue uppercase border-b-2 border-behance-blue/20 hover:border-behance-blue transition-all"
            >
              {t("common.source")}
            </a>
          )}

          {/* AUTO-UPDATE ROBOT */}
          <button
            onClick={onToggleSchedule}
            type="button"
            disabled={isDemoMode}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl transition-all cursor-pointer ${
              isDemoMode
                ? "opacity-50 cursor-not-allowed bg-gray-500/10 text-gray-400"
                : project?.isScheduled
                  ? "bg-green-500/10 text-green-500 shadow-sm shadow-green-500/10"
                  : "bg-gray-500/10 text-gray-400"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                project?.isScheduled ? "bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" : "bg-gray-400"
              }`}
            />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {t("dashboard.header.robot")}: {project?.isScheduled ? t("dashboard.header.robotActive") : t("dashboard.header.robotOff")}
            </span>
          </button>

          {/* TAG BALANCE */}
          {!isDemoMode && (
            <button
              onClick={onNavigatePricing}
              type="button"
              className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase border transition-all cursor-pointer ${
                hasEnoughBalance
                  ? isDark
                    ? "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10"
                    : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200 shadow-xs"
                  : isDark
                    ? "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
                    : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
              }`}
            >
              {t("dashboard.meta.balance")}: {tagBalance} {!hasEnoughBalance && "⚠️"}
            </button>
          )}

          {/* VIDEO TUTORIAL GUIDE TRIGGER */}
          {onOpenVideoTutorial && (
            <button
              onClick={onOpenVideoTutorial}
              type="button"
              className="px-3.5 py-2 rounded-2xl bg-behance-blue/10 text-behance-blue text-[10px] font-black uppercase tracking-wider hover:bg-behance-blue hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>▶️</span>
              <span>Видео-гид</span>
            </button>
          )}
        </div>
      </div>

      {/* RIGHT: REFRESH RANKINGS BUTTON */}
      <button
        onClick={onRefreshRankings}
        disabled={actionLoading || isBusy || isDemoMode}
        type="button"
        className={`w-full md:w-auto px-8 md:px-12 py-4 md:py-6 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
          isDemoMode
            ? "opacity-30 cursor-not-allowed bg-gray-500 text-white"
            : isBusy
              ? "bg-behance-blue text-white animate-pulse shadow-blue-500/25"
              : isDark
                ? "bg-white text-black shadow-white/5 hover:bg-gray-100"
                : "bg-black text-white shadow-black/20 hover:bg-gray-900"
        }`}
      >
        {isBusy
          ? status === "PENDING"
            ? t("dashboard.header.updateBtnPending")
            : t("dashboard.header.updateBtnProcessing")
          : t("dashboard.header.updateBtn")}
      </button>
    </div>
  );
};
