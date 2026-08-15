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
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  stats,
  views,
  appreciations,
  comments,
  activeFilter,
  onFilterChange,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* 1. TOP 10 */}
      <div
        onClick={() => onFilterChange(activeFilter === "top10" ? "all" : "top10")}
        title="Теги на 1-10 месте в поиске Behance (кликните для фильтрации)"
        className={`p-4 rounded-xl border transition-all cursor-pointer hover:border-green-500/50 ${
          activeFilter === "top10"
            ? "border-green-500 bg-green-500/10 shadow-xs ring-1 ring-green-500/30"
            : isDark
              ? "bg-[#141418] border-white/10"
              : "bg-white border-zinc-200 shadow-xs"
        }`}
      >
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider opacity-60">
          <span>В ТОП-10</span>
          <span>🏆</span>
        </div>
        <div className="flex items-baseline gap-1.5 mt-2">
          <span className="text-2xl font-black text-green-500">{stats.top10}</span>
          <span className="text-[10px] font-semibold opacity-40">из {stats.total} тегов</span>
        </div>
      </div>

      {/* 2. POTENTIAL */}
      <div
        onClick={() => onFilterChange(activeFilter === "potential" ? "all" : "potential")}
        title="Теги на 11-30 месте — точки быстрого роста в ТОП-10"
        className={`p-4 rounded-xl border transition-all cursor-pointer hover:border-behance-blue/50 ${
          activeFilter === "potential"
            ? "border-behance-blue bg-behance-blue/10 shadow-xs ring-1 ring-blue-500/30"
            : isDark
              ? "bg-[#141418] border-white/10"
              : "bg-white border-zinc-200 shadow-xs"
        }`}
      >
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider opacity-60">
          <span>Потенциал (11–30)</span>
          <span>🚀</span>
        </div>
        <div className="flex items-baseline gap-1.5 mt-2">
          <span className="text-2xl font-black text-behance-blue">{stats.potential}</span>
          <span className="text-[10px] font-semibold opacity-40">из {stats.total} тегов</span>
        </div>
      </div>

      {/* 3. VIEWS */}
      <div
        className={`p-4 rounded-xl border transition-all ${
          isDark ? "bg-[#141418] border-white/10" : "bg-white border-zinc-200 shadow-xs"
        }`}
      >
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider opacity-60">
          <span>Просмотры</span>
          <span>👁️</span>
        </div>
        <div className="flex items-baseline gap-1.5 mt-2">
          <span className="text-2xl font-black">{views.toLocaleString()}</span>
        </div>
      </div>

      {/* 4. LIKES */}
      <div
        className={`p-4 rounded-xl border transition-all ${
          isDark ? "bg-[#141418] border-white/10" : "bg-white border-zinc-200 shadow-xs"
        }`}
      >
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider opacity-60">
          <span>Оценки (Лайки)</span>
          <span>👍</span>
        </div>
        <div className="flex items-baseline gap-1.5 mt-2">
          <span className="text-2xl font-black text-pink-500">
            {appreciations.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 5. COMMENTS */}
      <div
        className={`col-span-2 sm:col-span-1 p-4 rounded-xl border transition-all ${
          isDark ? "bg-[#141418] border-white/10" : "bg-white border-zinc-200 shadow-xs"
        }`}
      >
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider opacity-60">
          <span>Комментарии</span>
          <span>💬</span>
        </div>
        <div className="flex items-baseline gap-1.5 mt-2">
          <span className="text-2xl font-black text-blue-400">
            {comments.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
