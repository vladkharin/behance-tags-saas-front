import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useTheme } from "../../context/ThemeContextInstance";
import type { AdminSummaryResponse } from "../../types/admin.types";

interface AdminOverviewTabProps {
  summary: AdminSummaryResponse | null;
  loading: boolean;
  onNavigateTab: (tab: "users" | "payments" | "activity") => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  summary,
  loading,
  onNavigateTab,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (loading || !summary) {
    return (
      <div className="py-20 text-center font-black uppercase tracking-[0.3em] opacity-40 animate-pulse">
        Загрузка аналитики платформы...
      </div>
    );
  }

  const { users, finance, scraper, chartTimeline } = summary;

  const totalPayingUsers = users.plans.DAILY_FRESH + users.plans.PRO_STREAM;
  const conversionRate =
    users.total > 0 ? Math.round((totalPayingUsers / users.total) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* USERS KPI */}
        <div
          onClick={() => onNavigateTab("users")}
          className={`p-6 rounded-[2.2rem] border transition-all cursor-pointer hover:scale-[1.02] ${
            isDark
              ? "bg-[#111111] border-white/5 shadow-inner"
              : "bg-white border-behance-border shadow-sm"
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
              Пользователи
            </span>
            <span className="text-base">👥</span>
          </div>
          <div className="mt-3">
            <span className="text-4xl font-black text-behance-black dark:text-white">
              {users.total}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] font-bold">
            <span className="text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md">
              +{users.today} сегодня
            </span>
            <span className="opacity-40">+{users.last7d} за 7 дн</span>
          </div>
        </div>

        {/* REVENUE KPI */}
        <div
          onClick={() => onNavigateTab("payments")}
          className={`p-6 rounded-[2.2rem] border transition-all cursor-pointer hover:scale-[1.02] ${
            isDark
              ? "bg-[#111111] border-white/5 shadow-inner"
              : "bg-white border-behance-border shadow-sm"
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
              Выручка
            </span>
            <span className="text-base">💰</span>
          </div>
          <div className="mt-3">
            <span className="text-4xl font-black text-green-500">
              {finance.totalRevenueRub.toLocaleString()} ₽
            </span>
            {finance.totalRevenueUsd > 0 && (
              <span className="text-xs font-bold opacity-60 ml-2">
                (${finance.totalRevenueUsd.toFixed(2)})
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] font-bold">
            <span className="text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md">
              {finance.successfulCount} успешных оплат
            </span>
            {finance.pendingCount > 0 && (
              <span className="text-amber-500 opacity-80">
                ({finance.pendingCount} ожидает)
              </span>
            )}
          </div>
        </div>

        {/* CONVERSION & PLANS */}
        <div
          className={`p-6 rounded-[2.2rem] border transition-all ${
            isDark
              ? "bg-[#111111] border-white/5 shadow-inner"
              : "bg-white border-behance-border shadow-sm"
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
              Платные клиенты
            </span>
            <span className="text-base">💎</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-black text-behance-blue">
              {totalPayingUsers}
            </span>
            <span className="text-xs font-bold opacity-40">
              ({conversionRate}% конверсия)
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] font-bold opacity-70">
            <span>Fresh: {users.plans.DAILY_FRESH}</span>
            <span>•</span>
            <span>Pro: {users.plans.PRO_STREAM}</span>
          </div>
        </div>

        {/* SCRAPER LOAD */}
        <div
          onClick={() => onNavigateTab("activity")}
          className={`p-6 rounded-[2.2rem] border transition-all cursor-pointer hover:scale-[1.02] ${
            isDark
              ? "bg-[#111111] border-white/5 shadow-inner"
              : "bg-white border-behance-border shadow-sm"
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
              Нагрузка робота
            </span>
            <span className="text-base">🤖</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-black text-purple-500">
              {scraper.totalProjects}
            </span>
            <span className="text-xs font-bold opacity-40">кейсов в БД</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] font-bold">
            <span className="text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-md">
              {scraper.totalTags.toLocaleString()} тегов
            </span>
            {scraper.pendingJobs + scraper.processingJobs > 0 && (
              <span className="text-amber-500 animate-pulse">
                • {scraper.pendingJobs + scraper.processingJobs} в работе
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. CHARTS & PLAN DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TIMELINE CHART (14 DAYS) */}
        <div
          className={`lg:col-span-2 p-8 rounded-[2.5rem] border ${
            isDark
              ? "bg-[#111111] border-white/5 shadow-inner"
              : "bg-white border-behance-border shadow-sm"
          }`}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">
                Динамика регистраций и активности
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1">
                Последние 14 дней
              </p>
            </div>
            <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-behance-blue/10 text-behance-blue">
              Новые пользователи
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartTimeline}>
                <defs>
                  <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0057ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0057ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={isDark ? "rgba(255,255,255,0.05)" : "#f0f0f0"}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: isDark ? "#666" : "#aaa" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: isDark ? "#666" : "#aaa" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div
                          className={`p-4 rounded-2xl border shadow-xl backdrop-blur-md ${
                            isDark
                              ? "bg-black/90 border-white/10 text-white"
                              : "bg-white/95 border-gray-200 text-black"
                          }`}
                        >
                          <p className="text-[10px] font-black uppercase opacity-40 mb-2">
                            {label}
                          </p>
                          <p className="text-xs font-bold text-behance-blue">
                            Пользователей: {payload[0]?.value}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#0057ff"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#userGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PLAN DISTRIBUTION WIDGET */}
        <div
          className={`p-8 rounded-[2.5rem] border flex flex-col justify-between ${
            isDark
              ? "bg-[#111111] border-white/5 shadow-inner"
              : "bg-white border-behance-border shadow-sm"
          }`}
        >
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider mb-1">
              Тарифная сетка
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-6">
              Распределение активных пользователей
            </p>

            <div className="space-y-4">
              {/* FREE */}
              <div>
                <div className="flex justify-between text-xs font-black uppercase mb-1.5">
                  <span className="opacity-60">Free (Базовый)</span>
                  <span>{users.plans.FREE} ({users.total > 0 ? Math.round((users.plans.FREE / users.total) * 100) : 0}%)</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gray-400 rounded-full"
                    style={{
                      width: `${users.total > 0 ? (users.plans.FREE / users.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* DAILY FRESH */}
              <div>
                <div className="flex justify-between text-xs font-black uppercase mb-1.5">
                  <span className="text-behance-blue">Daily Fresh</span>
                  <span className="text-behance-blue">
                    {users.plans.DAILY_FRESH} ({users.total > 0 ? Math.round((users.plans.DAILY_FRESH / users.total) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-behance-blue rounded-full"
                    style={{
                      width: `${users.total > 0 ? (users.plans.DAILY_FRESH / users.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* PRO STREAM */}
              <div>
                <div className="flex justify-between text-xs font-black uppercase mb-1.5">
                  <span className="text-amber-500">Pro Stream</span>
                  <span className="text-amber-500">
                    {users.plans.PRO_STREAM} ({users.total > 0 ? Math.round((users.plans.PRO_STREAM / users.total) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${users.total > 0 ? (users.plans.PRO_STREAM / users.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-behance-border dark:border-white/5 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="opacity-40">Авто-расписание:</span>
              <span className="text-green-500 font-black">
                {scraper.scheduledProjects} проектов
              </span>
            </div>
            <div className="flex justify-between text-xs font-bold">
              <span className="opacity-40">Всего тегов в базе:</span>
              <span className="font-black">
                {scraper.totalTags.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
