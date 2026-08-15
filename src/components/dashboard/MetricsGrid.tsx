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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 md:gap-4">
      {/* 1. TOP 10 */}
      <div
        onClick={() => onFilterChange(activeFilter === "top10" ? "all" : "top10")}
        title="Теги на 1-10 месте в поиске Behance (кликните для фильтрации)"
        className={`p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.03] group ${
          activeFilter === "top10"
            ? "border-green-500 bg-green-500/10 shadow-lg shadow-green-500/10 scale-[1.02]"
            : isDark
              ? "bg-[#111111] border-white/5 shadow-inner"
              : "bg-white border-behance-border shadow-sm"
        }`}
      >
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
            Top 10
          </span>
          <span className="text-[9px] opacity-30 group-hover:opacity-100 transition-opacity">
            🏆
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl md:text-4xl font-black text-green-500">
            {stats.top10}
          </span>
          <span className="text-[10px] font-bold opacity-30">/ {stats.total}</span>
        </div>
      </div>

      {/* 2. POTENTIAL */}
      <div
        onClick={() => onFilterChange(activeFilter === "potential" ? "all" : "potential")}
        title="Теги на 11-30 месте — точки быстрого роста в ТОП-10 (кликните для фильтрации)"
        className={`p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.03] group ${
          activeFilter === "potential"
            ? "border-behance-blue bg-behance-blue/10 shadow-lg shadow-blue-500/10 scale-[1.02]"
            : isDark
              ? "bg-[#111111] border-white/5 shadow-inner"
              : "bg-white border-behance-border shadow-sm"
        }`}
      >
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
            Potential (11-30)
          </span>
          <span className="text-[9px] opacity-30 group-hover:opacity-100 transition-opacity">
            🚀
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl md:text-4xl font-black text-behance-blue">
            {stats.potential}
          </span>
          <span className="text-[10px] font-bold opacity-30">/ {stats.total}</span>
        </div>
      </div>

      {/* 3. VIEWS */}
      <div
        title="Суммарное количество просмотров кейса на Behance"
        className={`p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border flex flex-col justify-between transition-all ${
          isDark ? "bg-[#111111] border-white/5 shadow-inner" : "bg-white border-behance-border shadow-sm"
        }`}
      >
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
            {t("dashboard.stats.views")}
          </span>
          <span className="text-[9px] opacity-30">👁️</span>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl md:text-4xl font-black text-behance-black dark:text-white">
            {views.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 4. LIKES */}
      <div
        title="Количество оценок (Appreciations) кейса"
        className={`p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border flex flex-col justify-between transition-all ${
          isDark ? "bg-[#111111] border-white/5 shadow-inner" : "bg-white border-behance-border shadow-sm"
        }`}
      >
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
            {t("dashboard.stats.likes")}
          </span>
          <span className="text-[9px] opacity-30">👍</span>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl md:text-4xl font-black text-pink-500">
            {appreciations.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 5. COMMENTS */}
      <div
        title="Количество комментариев под работой на Behance"
        className={`col-span-2 sm:col-span-1 p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border flex flex-col justify-between transition-all ${
          isDark ? "bg-[#111111] border-white/5 shadow-inner" : "bg-white border-behance-border shadow-sm"
        }`}
      >
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
            {t("dashboard.stats.comments")}
          </span>
          <span className="text-[9px] opacity-30">💬</span>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl md:text-4xl font-black text-blue-500">
            {comments.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
