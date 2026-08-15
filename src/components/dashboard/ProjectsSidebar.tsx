import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContextInstance";
import type { BehanceProject, PlanType } from "../../types/analytics.types";

interface ProjectsSidebarProps {
  projects: BehanceProject[];
  selectedProjectId: string | null;
  isDemoMode: boolean;
  isAddingNew: boolean;
  userPlan: PlanType;
  maxProjects: number;
  isAdmin?: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onSelectProject: (id: string) => void;
  onAddNewProject: () => void;
  onNavigatePricing: () => void;
  onNavigateLegal: (view: "help" | "plans" | "terms" | "privacy" | "refund") => void;
  onNavigateAdmin?: () => void;
  logout: () => void;
}

export const ProjectsSidebar: React.FC<ProjectsSidebarProps> = ({
  projects,
  selectedProjectId,
  isDemoMode,
  isAddingNew,
  userPlan,
  maxProjects,
  isAdmin,
  isOpenMobile,
  onCloseMobile,
  onSelectProject,
  onAddNewProject,
  onNavigatePricing,
  onNavigateLegal,
  onNavigateAdmin,
  logout,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const isDark = theme === "dark";

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "ru" ? "en" : "ru");
  };

  const sidebarContent = (
    <div
      className={`w-80 h-full border-r flex flex-col z-40 transition-colors duration-300 ${
        isDark ? "bg-[#111111] border-white/5 shadow-2xl" : "bg-white border-behance-border shadow-sm"
      }`}
    >
      {/* BRANDING & THEME / LANG CONTROLS */}
      <div className="p-8 border-b border-behance-border dark:border-white/5 text-center relative">
        <button
          onClick={toggleLanguage}
          type="button"
          aria-label="Toggle language"
          className={`absolute top-4 left-4 text-[9px] font-black w-8 h-8 rounded-full transition-all shadow-sm flex items-center justify-center cursor-pointer ${
            isDark ? "bg-white/5 text-blue-400 hover:bg-white/10" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {i18n.language.toUpperCase().substring(0, 2)}
        </button>

        <h1 className="text-3xl font-black tracking-tighter uppercase leading-none italic">
          BeRanked
        </h1>
        <div className="h-1 w-8 bg-behance-blue mx-auto mt-3 rounded-full shadow-[0_0_15px_rgba(0,87,255,0.4)]"></div>

        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            type="button"
            aria-label="Toggle theme"
            className={`text-xs w-8 h-8 rounded-full transition-all shadow-sm flex items-center justify-center cursor-pointer ${
              isDark ? "bg-white/5 text-yellow-400 hover:bg-white/10" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
            }`}
          >
            {isDark ? "☀️" : "🌙"}
          </button>
          <button
            onClick={onCloseMobile}
            type="button"
            aria-label="Close sidebar"
            className="lg:hidden text-xs w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      </div>

      {/* PROJECTS LIST */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {/* OWNER ADMIN BUTTON (IF ADMIN) */}
        {isAdmin && onNavigateAdmin && (
          <button
            onClick={() => {
              onNavigateAdmin();
              onCloseMobile();
            }}
            type="button"
            className="w-full p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500 hover:text-black text-amber-500 font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition-all cursor-pointer mb-2"
          >
            <span>👑</span>
            <span>Панель владельца</span>
          </button>
        )}

        {/* ADD PROJECT BUTTON */}
        <button
          onClick={() => {
            onAddNewProject();
            onCloseMobile();
          }}
          type="button"
          className={`w-full p-5 rounded-3xl border-2 border-dashed flex items-center justify-center gap-3 cursor-pointer transition-all ${
            isAddingNew && !isDemoMode
              ? "border-behance-blue bg-behance-blue/5 text-behance-blue shadow-inner"
              : "border-behance-border text-behance-muted hover:border-behance-blue dark:border-white/10"
          }`}
        >
          <span className="text-lg leading-none">＋</span>
          <span className="text-[10px] font-black uppercase tracking-widest">
            {t("sidebar.newProject")}
          </span>
        </button>

        {/* PROJECTS CARDS */}
        {projects.map((p) => {
          const status = p.analysisStatus;
          const isActive = selectedProjectId === p.id && !isDemoMode && !isAddingNew;

          return (
            <div
              key={p.id}
              onClick={() => {
                onSelectProject(p.id);
                onCloseMobile();
              }}
              className={`p-5 rounded-[2rem] cursor-pointer transition-all duration-300 relative border text-left ${
                isActive
                  ? "bg-behance-blue border-behance-blue text-white shadow-xl scale-[1.02]"
                  : isDark
                    ? "bg-white/5 border-transparent text-gray-400 hover:bg-white/10"
                    : "bg-white border-behance-border hover:shadow-md transition-all"
              }`}
            >
              {status !== "IDLE" && (
                <div
                  className={`absolute top-5 right-6 w-2.5 h-2.5 rounded-full ${
                    status === "PENDING"
                      ? "bg-amber-400 shadow-[0_0_10px_#fbbf24]"
                      : "bg-white animate-ping"
                  }`}
                />
              )}
              <div className="text-[11px] font-black truncate uppercase pr-6">
                {p.title || "Untitled Project"}
              </div>
              <div
                className={`text-[8px] mt-1.5 font-bold uppercase tracking-widest ${
                  isActive ? "text-white/60" : "opacity-40"
                }`}
              >
                {status === "PENDING"
                  ? t("sidebar.status.pending")
                  : status === "PROCESSING"
                    ? t("sidebar.status.processing")
                    : t("sidebar.status.active")}
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER ACTIONS */}
      <div className="p-5 border-t border-behance-border dark:border-white/5 space-y-2 text-center">
        {/* PLAN BADGE */}
        <div
          className={`mb-3 p-3.5 rounded-2xl border text-center transition-all ${
            isDark ? "bg-white/5 border-white/5" : "bg-behance-grayBg border-behance-border"
          }`}
        >
          <span className="text-[9px] font-black uppercase opacity-40 block mb-0.5">
            {t("dashboard.meta.plan")}
          </span>
          <span
            className={`text-xs font-black uppercase tracking-widest ${
              isDemoMode ? "text-amber-400 animate-pulse" : "text-behance-blue"
            }`}
          >
            {isDemoMode ? "PRO STREAM (DEMO)" : userPlan}
          </span>
          <span className="text-[9px] font-semibold opacity-30 block mt-0.5">
            {projects.length}/{maxProjects} projects
          </span>
        </div>

        <button
          onClick={() => {
            onNavigateLegal("help");
            onCloseMobile();
          }}
          type="button"
          className="w-full py-3 rounded-xl bg-behance-blue/5 text-behance-blue text-[10px] font-black uppercase tracking-widest hover:bg-behance-blue/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span className="text-sm leading-none">❓</span> {t("help.title")}
        </button>

        <button
          onClick={() => {
            onNavigatePricing();
            onCloseMobile();
          }}
          type="button"
          className="w-full py-3.5 rounded-2xl border border-behance-blue/20 bg-white dark:bg-white/5 text-[10px] font-black uppercase tracking-widest hover:border-behance-blue transition-all cursor-pointer"
        >
          {t("sidebar.managePlan")}
        </button>

        <button
          onClick={logout}
          type="button"
          className="w-full py-2 text-[10px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity cursor-pointer"
        >
          {t("sidebar.logout")}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block h-full shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile drawer backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
