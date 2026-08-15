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
      className={`w-72 h-full border-r flex flex-col z-40 transition-colors duration-200 ${
        isDark
          ? "bg-[#101014] border-white/10 text-zinc-100"
          : "bg-white border-zinc-200 text-zinc-900 shadow-xs"
      }`}
    >
      {/* BRANDING & CONTROLS HEADER */}
      <div className="p-5 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-behance-blue flex items-center justify-center text-white font-black text-xs shadow-md shadow-blue-500/20">
            Be
          </div>
          <div>
            <span className="text-sm font-black uppercase tracking-wider block leading-tight">
              BeRanked
            </span>
            <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest block">
              SEO Suite
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleLanguage}
            type="button"
            className="w-7 h-7 rounded-lg text-[10px] font-black uppercase hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer opacity-70 hover:opacity-100"
          >
            {i18n.language.toUpperCase().substring(0, 2)}
          </button>
          <button
            onClick={toggleTheme}
            type="button"
            className="w-7 h-7 rounded-lg text-xs hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer opacity-70 hover:opacity-100"
          >
            {isDark ? "☀️" : "🌙"}
          </button>
          <button
            onClick={onCloseMobile}
            type="button"
            className="lg:hidden w-7 h-7 rounded-lg text-xs hover:bg-zinc-100 dark:hover:bg-white/10 flex items-center justify-center opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      </div>

      {/* PROJECTS LIST */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {/* OWNER ADMIN BUTTON */}
        {isAdmin && onNavigateAdmin && (
          <button
            onClick={() => {
              onNavigateAdmin();
              onCloseMobile();
            }}
            type="button"
            className="w-full p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500 hover:text-black text-amber-500 font-black uppercase text-[10px] tracking-wider flex items-center justify-between transition-all cursor-pointer mb-2"
          >
            <div className="flex items-center gap-2">
              <span>👑</span>
              <span>Панель владельца</span>
            </div>
            <span className="text-[9px] opacity-70">➔</span>
          </button>
        )}

        {/* ADD PROJECT BUTTON */}
        <button
          onClick={() => {
            onAddNewProject();
            onCloseMobile();
          }}
          type="button"
          className={`w-full p-3 rounded-xl border border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all ${
            isAddingNew && !isDemoMode
              ? "border-behance-blue bg-behance-blue/10 text-behance-blue font-bold shadow-xs"
              : "border-zinc-300 dark:border-white/15 text-zinc-500 hover:border-behance-blue hover:text-behance-blue"
          }`}
        >
          <span className="text-sm font-bold">＋</span>
          <span className="text-[11px] font-bold uppercase tracking-wider">
            {t("sidebar.newProject")}
          </span>
        </button>

        <div className="pt-2">
          <span className="text-[9px] font-black uppercase tracking-widest opacity-40 px-2 block mb-1.5">
            Кейсы на мониторинге ({projects.length}/{maxProjects})
          </span>

          {/* PROJECT CARDS */}
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
                className={`p-3 rounded-xl cursor-pointer transition-all text-left flex items-center justify-between border ${
                  isActive
                    ? "bg-behance-blue border-behance-blue text-white shadow-md shadow-blue-500/15"
                    : isDark
                      ? "bg-white/5 border-transparent text-zinc-400 hover:bg-white/10 hover:text-white"
                      : "bg-zinc-50 border-zinc-200/80 text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-bold truncate leading-tight">
                    {p.title || "Untitled Project"}
                  </div>
                  <div
                    className={`text-[9px] mt-0.5 font-medium uppercase tracking-wider ${
                      isActive ? "text-white/70" : "opacity-40"
                    }`}
                  >
                    {status === "PENDING"
                      ? "В очереди"
                      : status === "PROCESSING"
                        ? "Анализ..."
                        : `${p.views.toLocaleString()} views`}
                  </div>
                </div>

                {status !== "IDLE" ? (
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      status === "PENDING"
                        ? "bg-amber-400 animate-pulse"
                        : "bg-white animate-ping"
                    }`}
                  />
                ) : (
                  <span
                    className={`text-[10px] font-mono opacity-40 ${
                      isActive ? "text-white" : ""
                    }`}
                  >
                    ➔
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="p-3.5 border-t border-zinc-200 dark:border-white/10 space-y-2">
        {/* PLAN BADGE */}
        <div
          className={`p-2.5 rounded-xl border flex items-center justify-between text-left ${
            isDark ? "bg-white/5 border-white/5" : "bg-zinc-100 border-zinc-200"
          }`}
        >
          <div>
            <span className="text-[8px] font-black uppercase opacity-40 block">Тариф</span>
            <span
              className={`text-[11px] font-black uppercase tracking-wider ${
                isDemoMode ? "text-amber-400" : "text-behance-blue"
              }`}
            >
              {isDemoMode ? "PRO (DEMO)" : userPlan}
            </span>
          </div>

          <button
            onClick={() => {
              onNavigatePricing();
              onCloseMobile();
            }}
            className="text-[9px] font-black uppercase px-2 py-1 rounded-lg bg-behance-blue text-white hover:bg-behance-darkBlue transition-colors cursor-pointer"
          >
            Upgrade
          </button>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() => {
              onNavigateLegal("help");
              onCloseMobile();
            }}
            type="button"
            className="flex-1 py-2 rounded-lg bg-zinc-100 dark:bg-white/5 text-[10px] font-bold uppercase hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors cursor-pointer text-center"
          >
            ❓ Manual
          </button>
          <button
            onClick={logout}
            type="button"
            className="py-2 px-3 rounded-lg bg-zinc-100 dark:bg-white/5 text-[10px] font-bold uppercase opacity-60 hover:opacity-100 hover:text-red-500 transition-colors cursor-pointer text-center"
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block h-full shrink-0">{sidebarContent}</aside>

      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        />
      )}

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
