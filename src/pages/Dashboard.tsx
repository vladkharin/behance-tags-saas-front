import React, { useState, useEffect, useCallback, useMemo } from "react";
import { formatDistanceToNow, addHours, isAfter } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { analyticsService } from "../services/analyticsService";
import { useTheme } from "../context/ThemeContextInstance";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../hooks/useAuth";
import { ProjectsSidebar } from "../components/dashboard/ProjectsSidebar";
import { MetricsGrid } from "../components/dashboard/MetricsGrid";
import { RankingsChart } from "../components/dashboard/RankingsChart";
import { TagsMatrix } from "../components/dashboard/TagsMatrix";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { AddProjectView } from "../components/dashboard/AddProjectView";
import { ShareCardModal } from "../components/dashboard/ShareCardModal";
import { EmptyProjectsView } from "../components/dashboard/EmptyProjectsView";
import { WelcomeModal } from "../components/WelcomeModal";
import { VideoTutorialModal } from "../components/ui/VideoTutorialModal";
import { ProfileModal } from "../components/ui/ProfileModal";
import { Footer } from "../components/Footer";
import { fireConfetti } from "../utils/confetti";
import {
  MOCK_DEMO_PROJECT,
  MOCK_DEMO_DETAILS,
  MOCK_DEMO_HISTORY,
} from "../utils/mockDemoData";
import type {
  BehanceProject,
  HistoryPoint,
  PlanType,
  ProjectDetailsResponse,
} from "../types/analytics.types";

const COLORS = [
  "#0057ff",
  "#00c853",
  "#ff0057",
  "#ffab00",
  "#7e57c2",
  "#26c6da",
  "#ec407a",
  "#ff5722",
  "#00bcd4",
  "#8bc34a",
];

const PLAN_HOURS: Record<PlanType, number> = { FREE: 168, DAILY_FRESH: 72, PRO_STREAM: 24 };
const PLAN_PROJECT_LIMITS: Record<PlanType, number> = { FREE: 1, DAILY_FRESH: 3, PRO_STREAM: 10 };

const normalizePlan = (rawPlan: string | undefined | null): PlanType => {
  if (!rawPlan) return "FREE";
  const formatted = rawPlan.toString().toUpperCase().trim().replace(/[-\s]/g, "_");
  if (formatted.includes("DAILY") || formatted.includes("FRESH")) return "DAILY_FRESH";
  if (formatted.includes("PRO") || formatted.includes("STREAM")) return "PRO_STREAM";
  return "FREE";
};

interface DashboardProps {
  onNavigatePricing: () => void;
  onNavigateLegal: (view: "help" | "plans" | "terms" | "privacy" | "refund") => void;
  onNavigateAdmin?: () => void;
  onNavigateAuth?: () => void;
  logout: () => void;
  initialDemo?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigatePricing,
  onNavigateLegal,
  onNavigateAdmin,
  onNavigateAuth,
  logout,
  initialDemo = false,
}) => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const { showToast, confirm } = useToast();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const isDark = theme === "dark";
  const dateLocale = i18n.language === "ru" ? ru : enUS;

  // --- STATE ---
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem("onboarding_complete") && !initialDemo);
  const [isVideoTutorialOpen, setIsVideoTutorialOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [projects, setProjects] = useState<BehanceProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(() => Boolean(initialDemo));
  const [projectData, setProjectData] = useState<ProjectDetailsResponse | null>(null);
  const [history, setHistory] = useState<Record<string, HistoryPoint[]>>({});
  const [visibleTags, setVisibleTags] = useState<string[]>([]);
  const [focusedTag, setFocusedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "top10" | "potential" | "lost">("all");
  const [isShareCardOpen, setIsShareCardOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const selectedProjectInSidebar = useMemo(() => {
    if (isDemoMode) return MOCK_DEMO_PROJECT;
    return projects.find((p) => p.id === selectedProjectId) || projectData?.activeProject;
  }, [projects, selectedProjectId, projectData, isDemoMode]);

  // Plan limits & normalizations
  const userPlan: PlanType = useMemo(() => {
    if (isDemoMode) return "PRO_STREAM";
    if (isAdmin) return "PRO_STREAM";
    const storedPlan = localStorage.getItem("userPlan");
    if (storedPlan) return normalizePlan(storedPlan);
    if ((projectData as any)?.userPlan || (projectData as any)?.plan) {
      return normalizePlan((projectData as any)?.userPlan || (projectData as any)?.plan);
    }
    return normalizePlan(user?.plan || "FREE");
  }, [isAdmin, isDemoMode, projectData, user?.plan]);

  const planLimits = useMemo(() => {
    const maxProjects = isDemoMode ? 10 : PLAN_PROJECT_LIMITS[userPlan] || 1;
    const intervalHours = PLAN_HOURS[userPlan] || 168;
    const hasCustomTags = userPlan !== "FREE" || isDemoMode;
    const hasTrends = userPlan !== "FREE" || isDemoMode;
    return { maxProjects, intervalHours, hasCustomTags, hasTrends };
  }, [userPlan, isDemoMode]);

  const hasEnoughBalance = useMemo(() => {
    if (isDemoMode) return true;
    if (!projectData) return true;
    const totalActive = projectData.tagsMatrix.length;
    return projectData.tagBalance >= totalActive;
  }, [projectData, isDemoMode]);

  const isSelectedProjectBusy = useMemo(() => {
    if (!selectedProjectInSidebar) return false;
    return selectedProjectInSidebar.analysisStatus !== "IDLE" || projectData?.status === "PROCESSING";
  }, [selectedProjectInSidebar, projectData?.status]);

  const stats = useMemo(() => {
    if (!projectData || !projectData.tagsMatrix) {
      return { top10: 0, potential: 0, total: 0, visibility: 0 };
    }
    const matrix = projectData.tagsMatrix;
    const top10 = matrix.filter((t) => typeof t.currentRank === "number" && t.currentRank >= 1 && t.currentRank <= 10).length;
    const potential = matrix.filter((t) => typeof t.currentRank === "number" && t.currentRank > 10 && t.currentRank <= 30).length;
    const total = matrix.length;
    const visibility = total > 0 ? Math.round((top10 / total) * 100) : 0;
    return { top10, potential, total, visibility };
  }, [projectData]);

  // Color assignments for tags on charts
  const tagColors = useMemo(() => {
    const map: Record<string, string> = {};
    if (!projectData?.tagsMatrix) return map;
    projectData.tagsMatrix.forEach((t, i) => {
      map[t.tag] = COLORS[i % COLORS.length];
    });
    return map;
  }, [projectData?.tagsMatrix]);

  // Filtered & sorted tags
  const sortedAndFilteredTags = useMemo(() => {
    if (!projectData?.tagsMatrix) return [];
    return [...projectData.tagsMatrix].sort((a, b) => {
      const rankA = typeof a.currentRank === "number" ? a.currentRank : 9999;
      const rankB = typeof b.currentRank === "number" ? b.currentRank : 9999;
      return rankA - rankB;
    });
  }, [projectData?.tagsMatrix]);

  // Refresh project details
  const refreshData = useCallback(
    async (targetId: string, isInitialLoad = false) => {
      if (isDemoMode || targetId === MOCK_DEMO_PROJECT.id) {
        setProjectData(MOCK_DEMO_DETAILS);
        setHistory(MOCK_DEMO_HISTORY);
        if (isInitialLoad && MOCK_DEMO_DETAILS.tagsMatrix) {
          const active = MOCK_DEMO_DETAILS.tagsMatrix.filter((t) => t.onChart).map((t) => t.tag);
          setVisibleTags(active);
        }
        return;
      }

      try {
        const [detailsRes, historyRes, listRes] = await Promise.all([
          analyticsService.getProjectDetails(targetId),
          analyticsService.getProjectHistory(targetId),
          analyticsService.getUserProjects(),
        ]);

        const prevStatus = projectData?.status;
        if (prevStatus === "PROCESSING" && detailsRes.status === "IDLE") {
          fireConfetti();
          showToast(t("dashboard.toasts.updateSuccess"), "success");
          if (visibleTags.length === 0) {
            const allTags = detailsRes.tagsMatrix.map((t) => t.tag);
            setVisibleTags(allTags);
            if (!isDemoMode) {
              analyticsService.toggleAllTagsOnChart(targetId, true).catch(() => {});
            }
          }
        }

        setProjects(listRes || []);
        setProjectData(detailsRes);
        setHistory(historyRes || {});

        if (isInitialLoad && detailsRes.tagsMatrix) {
          const active = detailsRes.tagsMatrix.filter((t) => t.onChart).map((t) => t.tag);
          setVisibleTags(active);
        }

        setIsPolling(listRes.some((p) => p.analysisStatus !== "IDLE") || detailsRes.status !== "IDLE");
      } catch (e) {
        console.error("Failed to refresh dashboard data", e);
      }
    },
    [projectData?.status, visibleTags.length, isDemoMode, showToast, t],
  );

  const handleTryDemo = useCallback(async () => {
    setDetailsLoading(true);
    try {
      setSelectedProjectId(MOCK_DEMO_PROJECT.id);
      setIsDemoMode(true);
      setIsAddingNew(false);
      setProjectData(MOCK_DEMO_DETAILS);
      setHistory(MOCK_DEMO_HISTORY);
      setVisibleTags(
        MOCK_DEMO_DETAILS.tagsMatrix.filter((t) => t.onChart).map((t) => t.tag)
      );
      showToast(t("dashboard.toasts.demoLoaded"), "info", undefined, 2000);
    } catch (e) {
      showToast(t("dashboard.toasts.demoNotFound"), "error");
    } finally {
      setDetailsLoading(false);
      setLoading(false);
    }
  }, [showToast, t]);

  // Initial load
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (initialDemo) {
        await handleTryDemo();
        if (mounted) setLoading(false);
        return;
      }

      try {
        const list = await analyticsService.getUserProjects();
        if (!mounted) return;

        const safeList = list || [];
        setProjects(safeList);

        if (safeList.length > 0) {
          const firstId = safeList[0].id;
          setSelectedProjectId(firstId);
          setIsDemoMode(false);
          await refreshData(firstId, true);
        } else {
          setIsAddingNew(true);
        }
      } catch (err) {
        console.error("Error during dashboard init", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, [initialDemo, handleTryDemo]);

  // Polling loop
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isPolling && selectedProjectId && !isDemoMode) {
      intervalId = setInterval(() => {
        refreshData(selectedProjectId);
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPolling, selectedProjectId, refreshData, isDemoMode]);

  // --- USER ACTIONS ---
  const handleProjectSelect = async (id: string) => {
    if (id === selectedProjectId && !isAddingNew) return;

    setSelectedProjectId(id);
    setIsDemoMode(false);
    setDetailsLoading(true);
    setIsAddingNew(false);
    setFocusedTag(null);
    setVisibleTags([]);

    try {
      await refreshData(id, true);
    } catch (e) {
      showToast(t("dashboard.toasts.loadError"), "error");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleAddNewProjectClick = () => {
    if (isDemoMode && !isAuthenticated) {
      confirm({
        title: t("dashboard.dialogs.demoAddProjectTitle"),
        message: t("dashboard.dialogs.demoAddProjectMsg"),
        confirmText: t("dashboard.dialogs.demoAddProjectConfirm"),
        cancelText: t("dashboard.dialogs.demoAddProjectCancel"),
        onConfirm: () => {
          if (onNavigateAuth) {
            onNavigateAuth();
          } else {
            onNavigatePricing();
          }
        },
      });
      return;
    }

    if (projects.length >= planLimits.maxProjects) {
      confirm({
        title: t("dashboard.dialogs.limitTitle"),
        message: t("dashboard.dialogs.limitMessage", { plan: userPlan, max: planLimits.maxProjects }),
        confirmText: t("dashboard.dialogs.limitConfirm"),
        cancelText: t("dashboard.dialogs.limitCancel"),
        onConfirm: () => onNavigatePricing(),
      });
      return;
    }
    setIsAddingNew(true);
    setSelectedProjectId(null);
  };

  // IMPORT CASE
  const handleImport = async (url: string, customTags?: string[]) => {
    setActionLoading(true);
    try {
      const newProj = await analyticsService.importCase(url);
      setProjects((prev) => [newProj, ...prev]);
      setSelectedProjectId(newProj.id);
      setIsAddingNew(false);
      setIsDemoMode(false);

      await analyticsService.analyzeProject(newProj.id, customTags);
      setIsPolling(true);
      showToast(t("dashboard.toasts.importSuccess"), "success");
      await refreshData(newProj.id, true);
    } catch (err: any) {
      const msg = err.response?.data?.message || t("dashboard.toasts.importError");
      showToast(msg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // REFRESH RANKINGS (SINGLE SCAN)
  const handleRefreshRankings = async () => {
    if (!selectedProjectId) return;

    if (isDemoMode) {
      showToast("В демо-режиме отображаются демонстрационные данные графика", "info");
      return;
    }

    if (!hasEnoughBalance) {
      confirm({
        title: "Недостаточно тегов Fuel",
        message: `Для сканирования требуется ${projectData?.tagsMatrix.length} тегов. Ваш текущий баланс: ${projectData?.tagBalance}. Пополните баланс тегов!`,
        confirmText: "Пополнить баланс",
        cancelText: "Отмена",
        onConfirm: () => onNavigatePricing(),
      });
      return;
    }

    setActionLoading(true);
    try {
      await analyticsService.analyzeProject(selectedProjectId);
      setIsPolling(true);
      showToast(t("dashboard.toasts.refreshSent"), "info");
      if (projectData) {
        setProjectData({ ...projectData, status: "PROCESSING" });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Ошибка запуска обновления";
      showToast(msg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // TOGGLE AUTO-UPDATE SCHEDULE
  const toggleAutoUpdate = async (state: boolean) => {
    if (!selectedProjectId) return;
    if (isDemoMode) {
      showToast("В демо-режиме робот включен по умолчанию", "info");
      return;
    }

    try {
      await analyticsService.toggleAutoUpdate(selectedProjectId, state);
      setProjects((prev) =>
        prev.map((p) => (p.id === selectedProjectId ? { ...p, isScheduled: state } : p)),
      );
      showToast(
        state
          ? t("dashboard.toasts.scheduleEnabled", { hours: planLimits.intervalHours })
          : t("dashboard.toasts.scheduleDisabled"),
        "success",
      );
    } catch (e) {
      showToast("Не удалось изменить расписание робота", "error");
    }
  };

  // TOGGLE TAG ON CHART
  const handleToggleTag = async (tagName: string) => {
    const isCurrentlyVisible = visibleTags.includes(tagName);
    const newTags = isCurrentlyVisible
      ? visibleTags.filter((t) => t !== tagName)
      : [...visibleTags, tagName];

    setVisibleTags(newTags);

    if (projectData) {
      setProjectData({
        ...projectData,
        tagsMatrix: projectData.tagsMatrix.map((t) =>
          t.tag === tagName ? { ...t, onChart: !isCurrentlyVisible } : t,
        ),
      });
    }

    if (!isDemoMode && selectedProjectId) {
      try {
        await analyticsService.toggleTagOnChart(selectedProjectId, tagName, !isCurrentlyVisible);
      } catch (e) {
        console.error("Failed to sync tag chart visibility", e);
      }
    }
  };

  // TOGGLE ALL TAGS ON CHART
  const handleToggleAllTags = async (state: boolean) => {
    if (!projectData) return;

    if (state) {
      const allTags = projectData.tagsMatrix.map((t) => t.tag);
      setVisibleTags(allTags);
      setProjectData({
        ...projectData,
        tagsMatrix: projectData.tagsMatrix.map((t) => ({ ...t, onChart: true })),
      });
    } else {
      setVisibleTags([]);
      setProjectData({
        ...projectData,
        tagsMatrix: projectData.tagsMatrix.map((t) => ({ ...t, onChart: false })),
      });
    }

    if (!isDemoMode && selectedProjectId) {
      try {
        await analyticsService.toggleAllTagsOnChart(selectedProjectId, state);
      } catch (e) {
        console.error("Failed to sync all tags on chart", e);
      }
    }
  };

  // ADD CUSTOM TAGS
  const handleAddCustomTags = async (tagsString: string) => {
    if (!selectedProjectId || !tagsString.trim()) return;

    if (isDemoMode) {
      showToast("Кастомные теги добавлены в демо-матрицу!", "success");
      return;
    }

    setActionLoading(true);
    try {
      const tagsList = tagsString
        .split(/[\n,;]+/)
        .map((t) => t.replace(/^#/, "").trim())
        .filter((t) => t.length > 0);

      await analyticsService.analyzeProject(selectedProjectId, tagsList);
      setIsPolling(true);
      showToast(`Добавлено ${tagsList.length} тегов в анализ! 🚀`, "success");
    } catch (e) {
      showToast("Не удалось добавить кастомные теги", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ADD SUGGESTED TAG
  const handleAddSuggestedTag = async (tagName: string) => {
    if (!selectedProjectId) return;

    if (isDemoMode) {
      showToast(`Тег #${tagName} добавлен в демо!`, "success");
      return;
    }

    setActionLoading(true);
    try {
      await analyticsService.analyzeProject(selectedProjectId, [tagName]);
      setIsPolling(true);
      showToast(`Рекомендованный тег #${tagName} добавлен в мониторинг! 🚀`, "success");
    } catch (e) {
      showToast("Не удалось добавить рекомендованный тег", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // REMOVE TAG FROM PROJECT MONITORING
  const handleRemoveTag = async (tagName: string) => {
    if (!selectedProjectId) return;

    if (isDemoMode) {
      if (projectData) {
        setProjectData({
          ...projectData,
          tagsMatrix: projectData.tagsMatrix.filter((t) => t.tag !== tagName),
        });
      }
      setVisibleTags((prev) => prev.filter((t) => t !== tagName));
      showToast(`Тег #${tagName} удален из демо`, "info");
      return;
    }

    try {
      await analyticsService.removeTagFromProject(selectedProjectId, tagName);
      showToast(`Тег #${tagName} удален из мониторинга кейса`, "info");
      if (projectData) {
        setProjectData({
          ...projectData,
          tagsMatrix: projectData.tagsMatrix.filter((t) => t.tag !== tagName),
        });
      }
      setVisibleTags((prev) => prev.filter((t) => t !== tagName));
    } catch (e) {
      showToast("Ошибка при удалении тега", "error");
    }
  };

  // DELETE PROJECT WITH 7-DAY POLICY
  const handleDeleteProject = () => {
    if (!selectedProjectId || !projectData) return;

    if (isDemoMode) {
      showToast("Демо-проект нельзя удалить", "info");
      return;
    }

    const isFree = userPlan === "FREE";
    const confirmMsg = isFree
      ? `Вы уверены, что хотите удалить проект "${selectedProjectInSidebar?.title || "кейс"}"? На бесплатном тарифе замена кейса доступна раз в 7 дней.`
      : `Вы уверены, что хотите удалить проект "${selectedProjectInSidebar?.title || "кейс"}"?`;

    confirm({
      title: "Удаление кейса",
      message: confirmMsg,
      confirmText: "Да, удалить",
      cancelText: "Отмена",
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await analyticsService.deleteProject(selectedProjectId);
          showToast("Проект успешно удален", "success");
          const updatedProjects = projects.filter((p) => p.id !== selectedProjectId);
          setProjects(updatedProjects);
          if (updatedProjects.length > 0) {
            setSelectedProjectId(updatedProjects[0].id);
            await refreshData(updatedProjects[0].id, true);
          } else {
            setIsAddingNew(true);
            setSelectedProjectId(null);
            setProjectData(null);
          }
        } catch (e: any) {
          const msg = e.response?.data?.message || "Ошибка при удалении проекта";
          showToast(msg, "error");
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-behance-grayBg dark:bg-behance-darkBg">
      {/* ONBOARDING WELCOME MODAL */}
      <WelcomeModal
        isOpen={showWelcome && !isDemoMode && Boolean(isAuthenticated)}
        onClose={() => setShowWelcome(false)}
        onOpenTutorial={() => setIsVideoTutorialOpen(true)}
      />

      {/* VIDEO TUTORIAL MODAL */}
      <VideoTutorialModal
        isOpen={isVideoTutorialOpen}
        onClose={() => setIsVideoTutorialOpen(false)}
      />

      {/* PERSONAL PROFILE MODAL (ЛИЧНЫЙ КАБИНЕТ) */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        email={user?.email}
        userPlan={userPlan}
        tagBalance={projectData?.tagBalance || 0}
        onNavigatePlans={onNavigatePricing}
        onLogout={logout}
      />

      {/* SIDEBAR */}
      <ProjectsSidebar
        projects={projects}
        selectedProjectId={selectedProjectId}
        isDemoMode={isDemoMode}
        isAddingNew={isAddingNew}
        userPlan={userPlan}
        maxProjects={planLimits.maxProjects}
        isAdmin={isAdmin}
        isAuthenticated={isAuthenticated}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onSelectProject={handleProjectSelect}
        onAddNewProject={handleAddNewProjectClick}
        onTryDemo={handleTryDemo}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onNavigateAuth={onNavigateAuth}
        onNavigatePricing={onNavigatePricing}
        onNavigateLegal={onNavigateLegal}
        onNavigateAdmin={onNavigateAdmin}
        logout={logout}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto flex flex-col relative">
        {/* TOP DEMO NOTIFICATION BANNER FOR GUESTS */}
        {!isAuthenticated && isDemoMode && (
          <div className="bg-gradient-to-r from-behance-blue via-indigo-600 to-blue-700 text-white px-4 py-3 text-xs font-bold flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left animate-in fade-in sticky top-0 z-40 shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-base">👁️</span>
              <span>
                {i18n.language === "ru"
                  ? "Вы находитесь в интерактивном Демо-режиме (Smart Watch UI/UX Case)."
                  : "You are currently viewing interactive Demo Mode (Smart Watch UI/UX Case)."}
              </span>
            </div>
            <button
              onClick={() => {
                if (onNavigateAuth) onNavigateAuth();
              }}
              type="button"
              className="px-4 py-1.5 rounded-xl bg-white text-behance-blue font-black uppercase text-[11px] shadow-sm hover:scale-105 transition-all cursor-pointer shrink-0"
            >
              🚀 {t("landing.nav.startFree")}
            </button>
          </div>
        )}

        {detailsLoading && (
          <div className="absolute inset-0 z-50 bg-white/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in">
            <div className="w-8 h-8 border-4 border-behance-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <div className="flex-1 p-4 md:p-8 lg:p-10 text-zinc-900 dark:text-zinc-100">
          {isAddingNew && !isDemoMode ? (
            <AddProjectView
              hasCustomTags={planLimits.hasCustomTags}
              actionLoading={actionLoading}
              onImport={handleImport}
              onTryDemo={handleTryDemo}
              onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
              onOpenVideoTutorial={() => setIsVideoTutorialOpen(true)}
            />
          ) : !loading && !isDemoMode && projects.length === 0 ? (
            <EmptyProjectsView
              onAddProject={handleImport}
              onLoadDemo={handleTryDemo}
              isAdding={actionLoading}
            />
          ) : (
            selectedProjectId &&
            projectData && (
              <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-300">
                {/* 1. PROJECT HEADER */}
                <DashboardHeader
                  project={selectedProjectInSidebar}
                  tagBalance={projectData.tagBalance}
                  hasEnoughBalance={hasEnoughBalance}
                  isDemoMode={isDemoMode}
                  isBusy={isSelectedProjectBusy}
                  actionLoading={actionLoading}
                  status={projectData.status}
                  userPlan={userPlan}
                  onRefreshRankings={handleRefreshRankings}
                  onToggleSchedule={toggleAutoUpdate}
                  onNavigatePricing={onNavigatePricing}
                  onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
                  onOpenVideoTutorial={() => setIsVideoTutorialOpen(true)}
                  onOpenShareCard={() => setIsShareCardOpen(true)}
                  onDeleteProject={handleDeleteProject}
                />

                {/* 2. VERDICT STATUS & TRAFFIC LIGHT */}
                <MetricsGrid
                  stats={stats}
                  views={projectData.activeProject?.views || 0}
                  appreciations={projectData.activeProject?.appreciations || 0}
                  comments={projectData.activeProject?.comments || 0}
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  tags={projectData.tagsMatrix.map((t) => t.tag)}
                  top10Tags={projectData.tagsMatrix
                    .filter((t) => typeof t.currentRank === "number" && t.currentRank >= 1 && t.currentRank <= 10)
                    .map((t) => t.tag)}
                />

                {/* 3. CRYSTAL CLEAR TAGS LIST */}
                <TagsMatrix
                  tags={sortedAndFilteredTags}
                  visibleTags={visibleTags}
                  suggestedTags={["smartwatch", "applewatch", "wearable", "uidesign", "fitnessapp"]}
                  tagColors={tagColors}
                  activeFilter={activeFilter}
                  hasCustomTags={planLimits.hasCustomTags}
                  hasTrends={planLimits.hasTrends}
                  isDemoMode={isDemoMode}
                  isBusy={isSelectedProjectBusy}
                  onToggleTag={handleToggleTag}
                  onToggleAllTags={handleToggleAllTags}
                  onAddCustomTags={handleAddCustomTags}
                  onAddSuggestedTag={handleAddSuggestedTag}
                  onRemoveTag={handleRemoveTag}
                  onFocusTag={(t) => setFocusedTag((prev) => (prev === t ? null : t))}
                />

                {/* 4. MAIN RANKINGS TIMELINE CHART */}
                <RankingsChart
                  hasHistory={Boolean(planLimits.hasCharts || isDemoMode)}
                  history={history}
                  visibleTags={visibleTags}
                  focusedTag={focusedTag}
                  tagColors={tagColors}
                  isBusy={isSelectedProjectBusy}
                  onNavigatePricing={onNavigatePricing}
                />
              </div>
            )
          )}
        </div>

        {/* FOOTER */}
        <Footer onNavigateLegal={onNavigateLegal} onNavigatePricing={onNavigatePricing} />

        {/* SHARE CARD MODAL */}
        {selectedProjectInSidebar && (
          <ShareCardModal
            isOpen={isShareCardOpen}
            onClose={() => setIsShareCardOpen(false)}
            projectTitle={selectedProjectInSidebar.title || "Behance Case"}
            topTags={sortedAndFilteredTags.filter((t) => t.currentRank && t.currentRank <= 10)}
            totalViews={projectData?.activeProject?.views || 0}
            totalLikes={projectData?.activeProject?.appreciations || 0}
          />
        )}
      </div>
    </div>
  );
};
