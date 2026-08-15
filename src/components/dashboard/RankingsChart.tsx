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
        className={`p-5 rounded-3xl border backdrop-blur-xl shadow-2xl transition-all ${maxWidthClass} ${
          isDark ? "bg-black/90 border-white/10 text-white" : "bg-white/95 border-gray-100 text-behance-black"
        }`}
      >
        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 opacity-40">{label}</p>
        <div className={`grid ${gridColsClass} gap-x-6 gap-y-2.5`}>
          {sortedPayload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-3 min-w-[160px]">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-2 h-2 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: entry.stroke }}></div>
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

  // Собираем массив данных для Recharts
  const chartData = React.useMemo(() => {
    const dates = new Set<string>();
    Object.values(history).forEach((th) => th.forEach((p) => dates.add(p.date)));

    return Array.from(dates)
      .sort()
      .map((date) => {
        const entry: Record<string, string | number> = { date };
        Object.keys(history).forEach((tagName) => {
          const point = history[tagName]?.find((pt) => pt.date === date);
          if (point) {
            entry[tagName] = point.rank;
          }
        });
        return entry;
      });
  }, [history]);

  const isChartEmpty = (visibleTags.length === 0 && !focusedTag) || chartData.length === 0;

  return (
    <div
      className={`p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border relative overflow-hidden transition-all duration-500 flex items-center justify-center ${
        isDark ? "bg-[#111111] border-white/5 shadow-inner" : "bg-white border-behance-border shadow-2xl shadow-blue-900/5"
      }`}
    >
      <div className="h-80 md:h-[450px] w-full flex items-center justify-center">
        {!hasHistory ? (
          <div className="text-center animate-in fade-in zoom-in-95 duration-500 p-6">
            <div className="text-4xl md:text-5xl mb-4">🔒</div>
            <h3 className="text-xs font-black uppercase tracking-[0.25em] opacity-50 leading-relaxed max-w-md mx-auto mb-6">
              {t("dashboard.chart.locked", "История позиций на графиках доступна на тарифах Daily Fresh и Pro Stream")}
            </h3>
            <button
              onClick={onNavigatePricing}
              type="button"
              className="px-8 py-3.5 rounded-2xl bg-behance-blue text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/25 hover:scale-105 transition-all cursor-pointer"
            >
              {t("sidebar.managePlan")}
            </button>
          </div>
        ) : isChartEmpty ? (
          <div className="text-center animate-in fade-in zoom-in-95 duration-500 p-6">
            <div className="text-4xl md:text-5xl mb-4 opacity-30">📊</div>
            <h3 className="text-xs font-black uppercase tracking-[0.25em] opacity-40 leading-relaxed whitespace-pre-line max-w-sm">
              {t("dashboard.chart.empty")}
            </h3>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={isDark ? "rgba(255,255,255,0.04)" : "#f0f0f0"} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fontWeight: 800, fill: isDark ? "#555" : "#aaa" }}
                dy={12}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                reversed
                tick={{ fontSize: 10, fontWeight: 800, fill: isDark ? "#555" : "#aaa" }}
                axisLine={false}
                tickLine={false}
                domain={[1, "auto"]}
              />
              <Tooltip
                content={<CustomTooltip isDark={isDark} />}
                cursor={{ stroke: isDark ? "rgba(255,255,255,0.1)" : "#eee", strokeWidth: 1.5 }}
                restrictDomPosition={true}
              />
              {Object.keys(history).map((tag) => {
                const isVisible = visibleTags.includes(tag);
                if (!isVisible) return null;

                const isFocused = focusedTag === tag;
                const opacity = focusedTag ? (isFocused ? 1 : 0.15) : 1;
                const width = isFocused ? 4 : 2;

                return (
                  <Line
                    key={tag}
                    type="monotone"
                    dataKey={tag}
                    name={tag}
                    stroke={tagColors[tag] || "#0057ff"}
                    strokeWidth={width}
                    strokeOpacity={opacity}
                    dot={isFocused ? { r: 5, fill: tagColors[tag] || "#0057ff", strokeWidth: 0 } : false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    connectNulls
                    animationDuration={400}
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
