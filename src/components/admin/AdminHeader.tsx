import React from "react";
import { useTheme } from "../../context/ThemeContextInstance";
import { useTranslation } from "react-i18next";

export type AdminTab = "overview" | "users" | "payments" | "activity";

interface AdminHeaderProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onBackToApp: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  onTabChange,
  onBackToApp,
  onRefresh,
  isRefreshing,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { i18n } = useTranslation();
  const isDark = theme === "dark";

  const tabs: Array<{ id: AdminTab; label: string; icon: string }> = [
    { id: "overview", label: "Обзор & KPI", icon: "📊" },
    { id: "users", label: "Пользователи", icon: "👥" },
    { id: "payments", label: "Платежи & Выручка", icon: "💳" },
    { id: "activity", label: "Живая лента", icon: "⚡" },
  ];

  return (
    <header
      className={`border-b sticky top-0 z-30 backdrop-blur-xl transition-colors ${
        isDark ? "bg-[#0a0a0a]/90 border-white/5 text-white" : "bg-white/90 border-behance-border text-behance-black"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* BRAND & EXIT */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToApp}
            type="button"
            className="px-3.5 py-1.5 rounded-xl bg-behance-blue/10 text-behance-blue text-[10px] font-black uppercase tracking-wider hover:bg-behance-blue hover:text-white transition-all cursor-pointer"
          >
            ← В приложение
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black uppercase tracking-[0.3em] text-behance-blue">
                BeRanked
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-widest border border-amber-500/20">
                Owner Suite
              </span>
            </div>
            <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">
              Панель аналитики и управления платформой
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-gray-200/60 dark:bg-white/5 backdrop-blur-md overflow-x-auto max-w-full">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                type="button"
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  isActive
                    ? "bg-white dark:bg-behance-blue text-behance-black dark:text-white shadow-md"
                    : "opacity-40 hover:opacity-90"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            type="button"
            title="Обновить данные"
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs border border-behance-border dark:border-white/10 transition-all cursor-pointer ${
              isRefreshing ? "animate-spin opacity-50" : "hover:bg-behance-blue hover:text-white hover:border-transparent"
            }`}
          >
            🔄
          </button>

          <button
            onClick={() => i18n.changeLanguage(i18n.language === "ru" ? "en" : "ru")}
            type="button"
            className={`text-[10px] font-black w-9 h-9 rounded-xl shadow-xs border border-behance-border dark:border-white/10 flex items-center justify-center cursor-pointer ${
              isDark ? "bg-white/5 text-blue-400" : "bg-white text-gray-700"
            }`}
          >
            {i18n.language.toUpperCase().substring(0, 2)}
          </button>

          <button
            onClick={toggleTheme}
            type="button"
            className={`w-9 h-9 rounded-xl shadow-xs border border-behance-border dark:border-white/10 flex items-center justify-center cursor-pointer text-xs ${
              isDark ? "bg-white/5 text-yellow-400" : "bg-white"
            }`}
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </header>
  );
};
