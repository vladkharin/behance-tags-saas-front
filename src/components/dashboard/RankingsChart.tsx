import React, { useState } from "react";
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

    return (
      <div
        className={`p-3.5 rounded-2xl border backdrop-blur-md shadow-2xl min-w-[220px] max-w-[340px] ${
          isDark ? "bg-[#0d0d12]/95 border-white/15 text-white" : "bg-white/95 border-zinc-200 text-zinc-900"
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-zinc-200 dark:border-white/10">
          <p className="text-[11px] font-mono font-black uppercase tracking-wider opacity-60">{label}</p>
          <span className="text-[10px] opacity-40 font-bold">{sortedPayload.length} тегов</span>
        </div>

        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-700">
          {sortedPayload.map((entry, index) => {
            const rankNum = Number(entry.value);
            const isTop = rankNum <= 10 && rankNum > 0;
            const isPotential = rankNum > 10 && rankNum <= 30;

            return (
              <div key={index} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div
                    className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: entry.stroke }}
                  />
                  <span className="font-medium text-xs truncate" title={`#${entry.name}`}>
                    #{entry.name}
                  </span>
                </div>
                <span
                  className={`font-mono font-black text-xs shrink-0 ${
                    isTop
                      ? "text-green-500"
                      : isPotential
                        ? "text-amber-500"
                        : "opacity-60"
                  }`}
                >
                  #{entry.value}
                </span>
              </div>
            );
          })}
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
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [isExpanded, setIsExpanded] = useState(false);

  // PAYWALL FOR FREE PLAN
  if (!hasHistory) {
    return (
      <div
        className={`p-4 rounded-2xl border transition-all ${
          isDark ? "bg-[#121216] border-white/10" : "bg-white border-zinc-200 shadow-sm"
        }`}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <span className="text-xs font-bold flex items-center gap-1.5">
              <span>📊</span>
              <span>История позиций по дням</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 font-bold uppercase">
                Pro
              </span>
            </span>
            <span className="text-[11px] opacity-60 block mt-0.5">
              Графики истории изменений за 14 дней доступны на тарифах Daily Fresh и Pro Stream
            </span>
          </div>

          <button
            onClick={onNavigatePricing}
            type="button"
            className="px-3 py-1.5 rounded-xl bg-behance-blue text-white text-xs font-bold uppercase tracking-wider cursor-pointer shrink-0"
          >
            Узнать больше
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
      className={`rounded-2xl border transition-all overflow-hidden ${
        isDark ? "bg-[#121216] border-white/10" : "bg-white border-zinc-200 shadow-sm"
      }`}
    >
      {/* ACCORDION TRIGGER */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        type="button"
        className="w-full p-4 md:p-5 flex justify-between items-center text-left hover:bg-zinc-500/5 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">📊</span>
          <div>
            <span className="text-xs md:text-sm font-bold block">
              {isExpanded ? "Скрыть детальные графики" : "Показать детальные графики истории позиций"}
            </span>
            <span className="text-[11px] opacity-50 block">
              {isExpanded
                ? "Динамика каждого тега в выдаче Behance по дням"
                : "Нажмите для просмотра изменений за 14 дней"}
            </span>
          </div>
        </div>

        <span className="text-xs font-bold px-2 py-1 rounded-lg bg-zinc-100 dark:bg-white/10">
          {isExpanded ? "▲ Свернуть" : "▼ Развернуть"}
        </span>
      </button>

      {/* EXPANDED CONTENT */}
      {isExpanded && (
        <div className="p-5 pt-0 border-t border-zinc-200 dark:border-white/10 mt-2 animate-in fade-in">
          <div className="h-64 w-full pt-4">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs opacity-50">
                Данные истории появятся после нескольких автоматических проверок
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

                  {activeTags.map((tag) => (
                    <Line
                      key={tag}
                      type="monotone"
                      dataKey={tag}
                      stroke={tagColors[tag] || "#0057ff"}
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
