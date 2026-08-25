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
  const { t } = useTranslation();
  if (active && payload && payload.length) {
    const validPayload = payload.filter((item) => item.value !== undefined && item.value !== null);
    const sortedPayload = [...validPayload].sort((a, b) => {
      const valA = Number(a.value) > 0 ? Number(a.value) : 999;
      const valB = Number(b.value) > 0 ? Number(b.value) : 999;
      return valA - valB;
    });

    const formattedLabel = label
      ? label.split("-").length === 3
        ? `${label.split("-")[2]}.${label.split("-")[1]}.${label.split("-")[0]}`
        : label
      : "";

    return (
      <div
        className={`p-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl w-64 max-w-[260px] z-50 ${
          isDark ? "bg-[#0c0c10]/95 border-white/20 text-white shadow-black/80" : "bg-white/95 border-zinc-200 text-zinc-900 shadow-xl"
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-zinc-200 dark:border-white/10">
          <p className="text-[11px] font-mono font-black tracking-wider opacity-70">{formattedLabel}</p>
          <span className="text-[10px] opacity-50 font-bold font-mono">
            {t("dashboard.chart.tagsCount", { count: sortedPayload.length })}
          </span>
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-700">
          {sortedPayload.map((entry, index) => {
            const rankNum = Number(entry.value);
            const isValidRank = rankNum > 0 && rankNum <= 100;
            const isTop = rankNum <= 10 && rankNum > 0;
            const isPotential = rankNum > 10 && rankNum <= 30;

            return (
              <div key={index} className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <div
                    className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: entry.stroke }}
                  />
                  <span className="font-medium text-[11px] truncate leading-tight" title={`#${entry.name}`}>
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
                  {isValidRank ? `#${rankNum}` : ">100"}
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
  const { t } = useTranslation();
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
              <span>{t("dashboard.chart.historyPaywallTitle")}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 font-bold uppercase">
                {t("dashboard.chart.proBadge")}
              </span>
            </span>
            <span className="text-[11px] opacity-60 block mt-0.5">
              {t("dashboard.chart.historyPaywallSubtitle")}
            </span>
          </div>

          <button
            onClick={onNavigatePricing}
            type="button"
            className="px-3 py-1.5 rounded-xl bg-behance-blue text-white text-xs font-bold uppercase tracking-wider cursor-pointer shrink-0"
          >
            {t("dashboard.chart.learnMore")}
          </button>
        </div>
      </div>
    );
  }

  // Format data for Recharts
  const dateMap: Record<string, Record<string, number | null>> = {};
  const activeTags = visibleTags.filter((tag) => history[tag]);

  activeTags.forEach((tag) => {
    history[tag]?.forEach((pt) => {
      const dateStr = pt.date;
      if (!dateMap[dateStr]) dateMap[dateStr] = {};
      const validRank = pt.rank > 0 && pt.rank <= 100 ? pt.rank : null;
      dateMap[dateStr][tag] = validRank;
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
              {isExpanded ? t("dashboard.chart.hideDetailed") : t("dashboard.chart.showDetailed")}
            </span>
            <span className="text-[11px] opacity-50 block">
              {isExpanded
                ? t("dashboard.chart.hideDetailedSubtitle")
                : t("dashboard.chart.showDetailedSubtitle")}
            </span>
          </div>
        </div>

        <span className="text-xs font-bold px-2 py-1 rounded-lg bg-zinc-100 dark:bg-white/10">
          {isExpanded ? t("dashboard.chart.collapseBtn") : t("dashboard.chart.expandBtn")}
        </span>
      </button>

      {/* EXPANDED CONTENT */}
      {isExpanded && (
        <div className="p-4 md:p-6 pt-0 border-t border-zinc-200 dark:border-white/10 animate-in fade-in">
          <div className="h-80 w-full pt-3">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs opacity-50">
                {t("dashboard.chart.noHistory")}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 15, right: 35, left: -15, bottom: 5 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={isDark ? "rgba(255,255,255,0.06)" : "#f0f0f0"}
                  />
                  <XAxis
                    dataKey="date"
                    stroke={isDark ? "#666" : "#999"}
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => {
                      if (!val) return "";
                      const parts = val.split("-");
                      if (parts.length === 3) return `${parts[2]}.${parts[1]}`;
                      return val;
                    }}
                  />
                  <YAxis
                    reversed={true}
                    domain={[1, 100]}
                    stroke={isDark ? "#666" : "#999"}
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    ticks={[1, 26, 51, 76, 100]}
                    tickFormatter={(val) => `#${val}`}
                  />
                  <Tooltip
                    content={<CustomTooltip isDark={isDark} />}
                    wrapperStyle={{ zIndex: 100, outline: "none" }}
                    allowEscapeViewBox={{ x: false, y: false }}
                  />

                  {activeTags.map((tag) => {
                    const isFocused = focusedTag === tag;
                    return (
                      <Line
                        key={tag}
                        type="monotone"
                        dataKey={tag}
                        stroke={tagColors[tag] || "#0057ff"}
                        strokeWidth={focusedTag ? (isFocused ? 3.5 : 1) : 2}
                        strokeOpacity={focusedTag ? (isFocused ? 1 : 0.2) : 1}
                        dot={{ r: isFocused ? 4 : 2 }}
                        activeDot={{ r: 6 }}
                        connectNulls={true}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
