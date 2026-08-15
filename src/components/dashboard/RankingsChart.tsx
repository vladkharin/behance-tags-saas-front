import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContextInstance";
import type { HistoryPoint } from "../../types/analytics.types";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    stroke: string;
  }>;
  label?: string;
  isDark: boolean;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, isDark }) => {
  if (active && payload && payload.length) {
    const sortedPayload = [...payload].sort((a, b) => (Number(a.value) || 999) - (Number(b.value) || 999));
    const itemsCount = sortedPayload.length;

    let gridColsClass = "grid-cols-1";
    let maxWidthClass = "max-w-xs";

    if (itemsCount > 12) {
      gridColsClass = "grid-cols-3";
      maxWidthClass = "max-w-4xl";
    } else if (itemsCount > 6) {
      gridColsClass = "grid-cols-2";
      maxWidthClass = "max-w-2xl";
    }

    return (
      <div
        className={`p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all ${maxWidthClass} ${
          isDark ? "bg-[#0d0d10]/95 border-white/10 text-white" : "bg-white/95 border-zinc-200 text-zinc-900"
        }`}
      >
        <p className="text-[10px] font-black uppercase tracking-wider mb-2.5 opacity-40">{label}</p>
        <div className={`grid ${gridColsClass} gap-x-5 gap-y-1.5`}>
          {sortedPayload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-3 min-w-[150px]">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.stroke }}></div>
                <span className="text-[11px] font-bold uppercase tracking-tight opacity-80 truncate" title={entry.name}>
                  {entry.name}
                </span>
              </div>
              <span className={`text-[11px] font-black shrink-0 ${Number(entry.value) <= 10 ? "text-green-500" : ""}`}>
                #{entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

interface RankingsChartProps {
  hasHistory: boolean;
  history: Record<string, HistoryPoint[]>;
  visibleTags: string[];
  focusedTag: string | null;
  tagColors: Record<string, string>;
  onNavigatePricing: () => void;
}

export const RankingsChart: React.FC<RankingsChartProps> = ({
  hasHistory,
  history,
  visibleTags,
  focusedTag,
  tagColors,
  onNavigatePricing,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // PAYWALL FOR FREE PLAN
  if (!hasHistory) {
    return (
      <div
        className={`p-8 rounded-2xl border text-center relative overflow-hidden transition-all ${
          isDark ? "bg-[#141418] border-white/10 shadow-inner" : "bg-white border-zinc-200 shadow-xs"
        }`}
      >
        <div className="max-w-md mx-auto space-y-4 py-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl mx-auto">
            🔒
          </div>
          <div>
            <h3 className="text-base font-black uppercase tracking-tight">
              Графики истории и динамики позиций
            </h3>
            <p className="text-xs opacity-60 leading-relaxed mt-1 font-medium">
              Доступны на тарифах Daily Fresh и Pro Stream. Отслеживайте историю изменений позиций каждого тега по дням.
            </p>
          </div>
          <button
            onClick={onNavigatePricing}
            className="px-6 py-2.5 rounded-xl bg-behance-blue hover:bg-behance-darkBlue text-white text-xs font-black uppercase tracking-wider shadow-md shadow-blue-500/20 hover:scale-105 transition-all cursor-pointer"
          >
            Открыть тарифы
          </button>
        </div>
      </div>
    );
  }

  // Format data for Recharts
  const dateMap: Record<string, Record<string, number>> = {};
  const activeTags = visibleTags.filter((tag) => history[tag]);

  activeTags.forEach((tag) => {
    history[tag]?.forEach((pt) => {
      if (!dateMap[pt.date]) dateMap[pt.date] = {};
      dateMap[pt.date][tag] = pt.rank;
    });
  });

  const chartData = Object.keys(dateMap)
    .sort()
    .map((date) => ({
      date,
      ...dateMap[date],
    }));

  return (
    <div
      className={`p-6 rounded-2xl border transition-all ${
        isDark ? "bg-[#141418] border-white/10" : "bg-white border-zinc-200 shadow-xs"
      }`}
    >
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider">
            История позиций тегов в поиске Behance
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-0.5">
            Шкала от #1 (вершина выдачи) до #100
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold opacity-60 uppercase">
            Отображается: {activeTags.length} тегов
          </span>
        </div>
      </div>

      <div className="h-72 w-full relative">
        {activeTags.length === 0 || chartData.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-zinc-500/5 rounded-xl border border-dashed border-zinc-300 dark:border-white/10">
            <span className="text-2xl mb-2">📈</span>
            <p className="text-xs font-bold uppercase tracking-wider opacity-60 max-w-sm leading-relaxed">
              {t("dashboard.chart.empty", "Выберите теги в матрице ниже для визуализации истории позиций")}
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={isDark ? "rgba(255,255,255,0.06)" : "#f0f0f0"}
              />
              <XAxis
                dataKey="date"
                stroke={isDark ? "#555" : "#aaa"}
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                reversed={true}
                domain={[1, 100]}
                stroke={isDark ? "#555" : "#aaa"}
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `#${val}`}
              />
              <Tooltip content={<CustomTooltip isDark={isDark} />} />

              {activeTags.map((tag) => {
                const isFocused = focusedTag === tag;
                const isAnotherFocused = focusedTag && focusedTag !== tag;
                return (
                  <Line
                    key={tag}
                    type="monotone"
                    dataKey={tag}
                    stroke={tagColors[tag] || "#0057ff"}
                    strokeWidth={isFocused ? 3.5 : isAnotherFocused ? 1 : 2}
                    opacity={isAnotherFocused ? 0.2 : 1}
                    dot={{ r: isFocused ? 4 : 2 }}
                    activeDot={{ r: 6 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
