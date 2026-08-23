import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContextInstance";

interface Stats {
  top10: number;
  potential: number;
  total: number;
  visibility: number;
}

interface MetricsGridProps {
  stats: Stats;
  views: number;
  appreciations: number;
  comments: number;
  activeFilter: "all" | "top10" | "potential" | "lost";
  onFilterChange: (filter: "all" | "top10" | "potential" | "lost") => void;
  onCopyTags?: () => void;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  stats,
  views,
  appreciations,
  comments,
  activeFilter,
  onFilterChange,
  onCopyTags,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const lostCount = Math.max(0, stats.total - stats.top10 - stats.potential);

  return (
    <div
      className={`p-5 md:p-6 rounded-2xl border transition-all ${
        isDark ? "bg-[#121216] border-white/10" : "bg-white border-zinc-200 shadow-sm"
      }`}
    >
      {/* 1. TOP VERDICT STATUS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-zinc-200 dark:border-white/10">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 block">
            {t("dashboard.metrics.verdictSubtitle")}
          </span>
          <h3 className="text-base md:text-lg font-black mt-0.5">
            {stats.top10 > 0 ? (
              <span className="text-green-500">
                {t("dashboard.metrics.verdictTop10", { top10: stats.top10, total: stats.total })}
              </span>
            ) : (
              <span className="opacity-80">
                {t("dashboard.metrics.verdictChecked", { total: stats.total })}
              </span>
            )}
          </h3>
        </div>

        {/* QUICK COPY BUTTON */}
        {onCopyTags && stats.total > 0 && (
          <button
            onClick={onCopyTags}
            type="button"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-behance-blue hover:bg-behance-darkBlue text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>📋</span>
            <span>{t("dashboard.metrics.copyTagsForBehance")}</span>
          </button>
        )}
      </div>

      {/* 2. TRAFFIC LIGHT STATUS BUTTONS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
        {/* 🟢 TOP 10 */}
        <button
          onClick={() => onFilterChange(activeFilter === "top10" ? "all" : "top10")}
          type="button"
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeFilter === "top10"
              ? "bg-green-500/15 border-green-500 ring-1 ring-green-500/30"
              : isDark
                ? "bg-white/5 border-white/5 hover:border-green-500/30"
                : "bg-zinc-50 border-zinc-200 hover:border-green-500/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-1.5 text-green-500">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>{t("dashboard.metrics.top10CardTitle")}</span>
            </span>
            <span className="text-lg font-black text-green-500">{stats.top10}</span>
          </div>
          <span className="text-[10px] opacity-50 block mt-1">
            {t("dashboard.metrics.top10CardSubtitle")}
          </span>
        </button>

        {/* 🟡 POTENTIAL (11-30) */}
        <button
          onClick={() => onFilterChange(activeFilter === "potential" ? "all" : "potential")}
          type="button"
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeFilter === "potential"
              ? "bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/30"
              : isDark
                ? "bg-white/5 border-white/5 hover:border-amber-500/30"
                : "bg-zinc-50 border-zinc-200 hover:border-amber-500/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-1.5 text-amber-500">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>{t("dashboard.metrics.potentialCardTitle")}</span>
            </span>
            <span className="text-lg font-black text-amber-500">{stats.potential}</span>
          </div>
          <span className="text-[10px] opacity-50 block mt-1">
            {t("dashboard.metrics.potentialCardSubtitle")}
          </span>
        </button>

        {/* ⚪ OUT OF TOP */}
        <button
          onClick={() => onFilterChange(activeFilter === "lost" ? "all" : "lost")}
          type="button"
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeFilter === "lost"
              ? "bg-zinc-500/20 border-zinc-400 ring-1 ring-zinc-400/30"
              : isDark
                ? "bg-white/5 border-white/5 hover:border-zinc-500/30"
                : "bg-zinc-50 border-zinc-200 hover:border-zinc-500/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-1.5 opacity-60">
              <span className="w-2 h-2 rounded-full bg-zinc-400" />
              <span>{t("dashboard.metrics.lostCardTitle")}</span>
            </span>
            <span className="text-lg font-black opacity-60">{lostCount}</span>
          </div>
          <span className="text-[10px] opacity-50 block mt-1">
            {t("dashboard.metrics.lostCardSubtitle")}
          </span>
        </button>
      </div>

      {/* 3. CASE STATS (VIEWS, LIKES, COMMENTS) */}
      <div className="flex items-center gap-4 md:gap-6 pt-4 mt-4 border-t border-zinc-200 dark:border-white/10 text-xs font-medium opacity-70 flex-wrap">
        <span>{t("dashboard.metrics.behanceStats")}</span>
        <span className="flex items-center gap-1">
          <span>👁️</span> <strong>{views.toLocaleString()}</strong> {t("dashboard.stats.views")}
        </span>
        <span className="flex items-center gap-1">
          <span>👍</span> <strong>{appreciations.toLocaleString()}</strong> {t("dashboard.stats.likes")}
        </span>
        <span className="flex items-center gap-1">
          <span>💬</span> <strong>{comments.toLocaleString()}</strong> {t("dashboard.stats.comments")}
        </span>
      </div>
    </div>
  );
};
