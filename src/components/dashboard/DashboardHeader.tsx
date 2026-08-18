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
  onOpenShareCard?: () => void;
  onDeleteProject?: () => void;
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
  onOpenShareCard,
  onDeleteProject,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-zinc-200 dark:border-white/10">
      {/* LEFT: TITLE, BEHANCE LINK, STATUS */}
      <div className="space-y-2 max-w-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            type="button"
            className="lg:hidden p-2 rounded-xl bg-zinc-100 dark:bg-white/5 text-xs font-bold"
            aria-label="Open sidebar"
          >
            ☰
          </button>

          <h1 className="text-2xl md:text-3xl font-black tracking-tight truncate leading-tight">
            {project?.title || "Untitled Project"}
          </h1>

          {isDemoMode && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[9px] font-black uppercase tracking-wider shrink-0">
              DEMO
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap text-xs">
          {project?.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-behance-blue hover:underline"
            >
              <span>Посмотреть на Behance</span>
              <span>↗</span>
            </a>
          )}

          <span className="text-zinc-300 dark:text-white/20">•</span>

          {/* AUTO-ROBOT SCHEDULE BADGE */}
          <button
            onClick={onToggleSchedule}
            type="button"
            disabled={isDemoMode}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
              project?.isScheduled
                ? "bg-green-500/10 text-green-500 border border-green-500/20"
                : "bg-zinc-100 dark:bg-white/5 text-zinc-400"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                project?.isScheduled ? "bg-green-500 animate-pulse" : "bg-zinc-400"
              }`}
            />
            <span>Робот: {project?.isScheduled ? "Активен (24ч)" : "Выключен"}</span>
          </button>

          {/* FUEL TAG BALANCE */}
          {!isDemoMode && (
            <button
              onClick={onNavigatePricing}
              type="button"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border transition-all cursor-pointer ${
                tagBalance < 50
                  ? "bg-red-500/10 text-red-500 border-red-500/30 animate-pulse"
                  : tagBalance < 150
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                    : isDark
                      ? "bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10"
                      : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              <span>Топливо: {tagBalance} тегов</span>
              {tagBalance < 150 && <span>(Пополнить ⚡)</span>}
            </button>
          )}
        </div>
      </div>

      {/* RIGHT: ACTIONS */}
      <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
        {onOpenShareCard && (
          <button
            onClick={onOpenShareCard}
            type="button"
            className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            title="Скачать или отправить отчет клиенту"
          >
            <span>📸</span>
            <span>Поделиться отчетом</span>
          </button>
        )}

        {onOpenVideoTutorial && (
          <button
            onClick={onOpenVideoTutorial}
            type="button"
            className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-behance-blue hover:text-white dark:hover:bg-behance-blue text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>▶️</span>
            <span>Видео-гид</span>
          </button>
        )}

        {!isDemoMode && onDeleteProject && (
          <button
            onClick={onDeleteProject}
            type="button"
            title="Удалить проект"
            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 text-xs transition-all cursor-pointer"
          >
            🗑️
          </button>
        )}

        <button
          onClick={onRefreshRankings}
          disabled={actionLoading || isBusy || isDemoMode}
          type="button"
          className={`flex-1 lg:flex-initial px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer ${
            isDemoMode
              ? "opacity-30 cursor-not-allowed bg-zinc-500 text-white"
              : isBusy
                ? "bg-behance-blue text-white animate-pulse"
                : "bg-behance-blue hover:bg-behance-darkBlue text-white shadow-blue-500/20 hover:scale-[1.02] active:scale-95"
          }`}
        >
          {isBusy
            ? status === "PENDING"
              ? "⏳ В очереди"
              : "🤖 Сканирование..."
            : "🔄 Обновить позиции"}
        </button>
      </div>
    </div>
  );
};
