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
  isAuthenticated?: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onSelectProject: (id: string) => void;
  onAddNewProject: () => void;
  onTryDemo?: () => void;
  onOpenProfile?: () => void;
  onNavigateAuth?: () => void;
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
  isAuthenticated = true,
  isOpenMobile,
  onCloseMobile,
  onSelectProject,
  onAddNewProject,
  onTryDemo,
  onOpenProfile,
  onNavigateAuth,
  onNavigatePricing,
  onNavigateLegal,
  onNavigateAdmin,
  logout,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const isDark = theme === "dark";

  const toggleLanguage = () => {
    const nextLang = i18n.language === "ru" ? "en" : "ru";
    i18n.changeLanguage(nextLang);
  };

  const sidebarContent = (
    <div
      className={`w-72 h-full flex flex-col border-r transition-all ${
        isDark
          ? "bg-[#0c0c0e] border-white/10 text-white"
          : "bg-white border-zinc-200 text-zinc-900 shadow-sm"
      }`}
    >
      {/* HEADER: LOGO & CONTROLS */}
      <div className="p-4 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-behance-blue text-white flex items-center justify-center font-black text-sm shadow-sm shadow-blue-500/30">
            B
          </div>
          <div>
            <h1 className="text-xs font-black tracking-tight bg-gradient-to-r from-behance-blue to-indigo-500 bg-clip-text text-transparent uppercase">
              BeRanked
            </h1>
            <span className="text-[9px] opacity-40 font-mono block">SEO SUITE</span>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-1.5">
          {/* LANG SWITCHER */}
          <button
            onClick={toggleLanguage}
            type="button"
            className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-[10px] font-bold uppercase transition-colors cursor-pointer"
            title="Switch Language"
          >
            {i18n.language === "ru" ? "RU" : "EN"}
          </button>

          {/* THEME TOGGLE */}
          <button
            onClick={toggleTheme}
            type="button"
            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-xs transition-colors cursor-pointer"
            title="Toggle Theme"
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          {/* MOBILE CLOSE */}
          <button
            onClick={onCloseMobile}
            type="button"
            className="lg:hidden p-1.5 rounded-lg bg-zinc-100 dark:bg-white/5 text-xs"
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
              <span>{t("sidebar.adminPanel")}</span>
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
            {t("sidebar.monitoredCases", { current: projects.length, max: maxProjects })}
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
                      : "bg-zinc-100/70 border-transparent text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-900"
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  {p.thumbnail ? (
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      className="w-7 h-7 rounded-lg object-cover shrink-0 border border-white/10"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-black/20 flex items-center justify-center text-xs shrink-0">
                      🎨
                    </div>
                  )}

                  <div className="overflow-hidden">
                    <h3
                      className={`text-xs font-bold truncate ${
                        isActive ? "text-white" : ""
                      }`}
                    >
                      {p.title || "Untitled Project"}
                    </h3>
                    <span
                      className={`text-[9px] block truncate ${
                        isActive ? "text-white/80" : "opacity-50"
                      }`}
                    >
                      {status === "PENDING"
                        ? t("dashboard.status.pending")
                        : status === "SCRAPING"
                          ? t("dashboard.status.scraping")
                          : status === "CHECKING_RANKS"
                            ? t("dashboard.status.checking")
                            : t("dashboard.status.idle")}
                    </span>
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

          {/* DEMO PROJECT BUTTON */}
          {onTryDemo && (
            <button
              onClick={() => {
                onTryDemo();
                onCloseMobile();
              }}
              type="button"
              className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer mt-2 ${
                isDemoMode
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-400 font-bold shadow-sm"
                  : "bg-amber-500/5 border-amber-500/20 text-amber-500/80 hover:bg-amber-500/10 hover:text-amber-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">⭐</span>
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  {t("dashboard.emptyState.demoBtn") || "Демо-проект"}
                </span>
              </div>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                DEMO
              </span>
            </button>
          )}
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
            <span className="text-[8px] font-black uppercase opacity-40 block">
              {t("dashboard.meta.plan") || "Plan"}
            </span>
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
            {userPlan === "PRO_STREAM" || isDemoMode
              ? t("sidebar.plansBtn")
              : t("sidebar.upgradeBtn")}
          </button>
        </div>

        {/* BOTTOM AUTH / PROFILE BUTTONS */}
        {!isAuthenticated && isDemoMode ? (
          <div className="pt-1 space-y-1">
            <button
              onClick={() => {
                if (onNavigateAuth) onNavigateAuth();
                onCloseMobile();
              }}
              type="button"
              className="w-full py-2 rounded-xl bg-behance-blue hover:bg-behance-darkBlue text-white text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              🚀 {t("landing.nav.startFree")}
            </button>
          </div>
        ) : (
          <div className="flex gap-1.5">
            {onOpenProfile && (
              <button
                onClick={() => {
                  onOpenProfile();
                  onCloseMobile();
                }}
                type="button"
                className="flex-1 py-2 rounded-lg bg-zinc-100 dark:bg-white/5 text-[10px] font-bold uppercase hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
              >
                <span>👤</span>
                <span className="truncate">{t("profile.title")}</span>
              </button>
            )}
            <button
              onClick={() => {
                onNavigateLegal("help");
                onCloseMobile();
              }}
              type="button"
              className="py-2 px-2.5 rounded-lg bg-zinc-100 dark:bg-white/5 text-[10px] font-bold uppercase hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors cursor-pointer text-center"
              title="Manual"
            >
              ❓
            </button>
            <button
              onClick={logout}
              type="button"
              className="py-2 px-2.5 rounded-lg bg-zinc-100 dark:bg-white/5 text-[10px] font-bold uppercase opacity-60 hover:opacity-100 hover:text-red-500 transition-colors cursor-pointer text-center"
              title={t("sidebar.logout")}
            >
              🚪
            </button>
          </div>
        )}
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
