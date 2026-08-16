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
import { WelcomeModal } from "../components/WelcomeModal";
import { VideoTutorialModal } from "../components/ui/VideoTutorialModal";
import { Footer } from "../components/Footer";
import { fireConfetti } from "../utils/confetti";
import type { BehanceProject, HistoryPoint, PlanType, ProjectDetailsResponse } from "../types/analytics.types";

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
  logout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigatePricing,
  onNavigateLegal,
  onNavigateAdmin,
  logout,
}) => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const { showToast, confirm } = useToast();
  const { isAdmin } = useAuth();
  const isDark = theme === "dark";
  const dateLocale = i18n.language === "ru" ? ru : enUS;

  // --- STATE ---
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem("onboarding_complete"));
  const [isVideoTutorialOpen, setIsVideoTutorialOpen] = useState(false);
  const [projects, setProjects] = useState<BehanceProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [projectData, setProjectData] = useState<ProjectDetailsResponse | null>(null);
  const [history, setHistory] = useState<Record<string, HistoryPoint[]>>({});
  const [visibleTags, setVisibleTags] = useState<string[]>([]);
  const [focusedTag, setFocusedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "top10" | "potential" | "lost">("all");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // --- PLAN CALCULATIONS ---
  const userPlan = useMemo<PlanType>(() => {
    if (isDemoMode) return "PRO_STREAM";
    return normalizePlan(projectData?.plan);
  }, [projectData, isDemoMode]);

  const planLimits = useMemo(() => {
    return {
      maxProjects: PLAN_PROJECT_LIMITS[userPlan] || 1,
      hasCustomTags: userPlan !== "FREE",
      hasHistory: userPlan !== "FREE",
      hasTrends: userPlan === "PRO_STREAM",
    };
  }, [userPlan]);

  // --- METRICS ---
  const stats = useMemo(() => {
    const tags = projectData?.tagsMatrix || [];
    const inSearch = tags.filter((t) => typeof t.currentRank === "number" && t.currentRank > 0);
    return {
      top10: tags.filter((t) => typeof t.currentRank === "number" && t.currentRank >= 1 && t.currentRank <= 10).length,
      potential: tags.filter((t) => typeof t.currentRank === "number" && t.currentRank > 10 && t.currentRank <= 30).length,
      total: tags.length,
      visibility: tags.length > 0 ? Math.round((inSearch.length / tags.length) * 100) : 0,
    };
  }, [projectData]);

  const nextUpdateTime = useMemo(() => {
    if (!projectData?.lastAnalyzedAt) return null;
    const planKey = normalizePlan(projectData.plan);
    const interval = PLAN_HOURS[planKey] || 168;
    return addHours(new Date(projectData.lastAnalyzedAt), interval);
  }, [projectData]);

  const canUpdateByTime = useMemo(() => {
    if (isDemoMode) return false;
    if (!projectData?.lastAnalyzedAt) return true;
    return isAfter(new Date(), nextUpdateTime!);
  }, [projectData, isDemoMode, nextUpdateTime]);

  const selectedProjectInSidebar = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || projectData?.activeProject || null,
    [projects, selectedProjectId, projectData],
  );

  const currentCost = useMemo(() => projectData?.tagsMatrix?.length || 0, [projectData]);
  const hasEnoughBalance = useMemo(() => (projectData?.tagBalance || 0) >= currentCost, [projectData, currentCost]);
  const isSelectedProjectBusy = useMemo(
    () => projectData?.status === "PENDING" || projectData?.status === "PROCESSING",
    [projectData],
  );

  const getTrend = useCallback(
    (tagName: string, currentRank: number | null) => {
      const tagHistory = history[tagName];
      if (!tagHistory || tagHistory.length < 2 || currentRank === null || currentRank <= 0) return 0;
      const prevRank = tagHistory[tagHistory.length - 2].rank;
      if (prevRank <= 0) return 0;
      return prevRank - currentRank;
    },
    [history],
  );

  const sortedAndFilteredTags = useMemo(() => {
    const tags = projectData?.tagsMatrix || [];
    let result = [...tags];

    if (activeFilter === "top10") {
      result = result.filter((t) => typeof t.currentRank === "number" && t.currentRank >= 1 && t.currentRank <= 10);
    } else if (activeFilter === "potential") {
      result = result.filter((t) => typeof t.currentRank === "number" && t.currentRank > 10 && t.currentRank <= 30);
    } else if (activeFilter === "lost") {
      result = result.filter((t) => t.currentRank === null || t.currentRank <= 0);
    }

    return result.sort((a, b) => {
      const rankA = a.currentRank === null || a.currentRank <= 0 ? 999 : a.currentRank;
      const rankB = b.currentRank === null || b.currentRank <= 0 ? 999 : b.currentRank;
      return rankA - rankB;
    });
  }, [projectData, activeFilter]);

  const tagColors = useMemo(() => {
    const map: Record<string, string> = {};
    projectData?.tagsMatrix?.forEach((item, idx) => {
      map[item.tag] = COLORS[idx % COLORS.length];
    });
    return map;
  }, [projectData]);

  // --- API DATA FETCHING ---
  const refreshData = useCallback(
    async (targetId: string, isInitialLoad = false) => {
      try {
        const [detailsRes, historyRes, listRes] = await Promise.all([
          analyticsService.getProjectDetails(targetId),
          analyticsService.getProjectHistory(targetId),
          analyticsService.getUserProjects(),
        ]);

        const prevStatus = projectData?.status;
        if (prevStatus === "PROCESSING" && detailsRes.status === "IDLE") {
          fireConfetti();
          showToast("Позиции успешно обновлены! 🎉", "success");
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
    [projectData?.status, visibleTags.length, isDemoMode, showToast],
  );

  // Initial load
  useEffect(() => {
    let mounted = true;

    const init = async () => {
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
  }, []);

  // Polling loop
  useEffect(() => {
    let intervalId: number | undefined;

    if (isPolling && selectedProjectId) {
      intervalId = window.setInterval(() => {
        refreshData(selectedProjectId);
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPolling, selectedProjectId, refreshData]);

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
      showToast("Не удалось загрузить данные проекта", "error");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleTryDemo = async () => {
    setDetailsLoading(true);
    try {
      const demo = await analyticsService.getDemoProject();
      if (demo && demo.id) {
        setSelectedProjectId(demo.id);
        setIsDemoMode(true);
        setIsAddingNew(false);
        await refreshData(demo.id, true);
        showToast("Запущен демо-проект для ознакомления", "info");
      } else {
        showToast("Демо-проект временно недоступен", "warning");
      }
    } catch (e) {
      showToast("Демо-проект не найден", "error");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleAddNewProjectClick = () => {
    if (projects.length >= planLimits.maxProjects) {
      confirm({
        title: "Лимит проектов",
        message: `Ваш текущий тариф (${userPlan}) позволяет отслеживать до ${planLimits.maxProjects} проектов. Обновите тариф для добавления новых.`,
        confirmText: "Перейти к тарифам",
        cancelText: "Понятно",
        onConfirm: () => onNavigatePricing(),
      });
      return;
    }

    setIsAddingNew(true);
    setSelectedProjectId(null);
    setIsDemoMode(false);
  };

  const handleRefreshRankings = async () => {
    if (isDemoMode) {
      showToast(t("dashboard.demo.restricted"), "warning");
      return;
    }

    if (!selectedProjectId || actionLoading || isSelectedProjectBusy || !projectData?.tagsMatrix) return;

    if (!hasEnoughBalance) {
      if (!canUpdateByTime) {
        const timeUntil = formatDistanceToNow(nextUpdateTime!, { addSuffix: true, locale: dateLocale });
        showToast(`Бесплатное обновление будет доступно ${timeUntil}`, "warning");
        return;
      }

      confirm({
        title: t("dashboard.errors.lowBalance"),
        message: `${t("dashboard.errors.lowBalance")}. Хотите пополнить баланс для внеочередных обновлений?`,
        confirmText: t("dashboard.errors.lowBalanceAction"),
        cancelText: "Отмена",
        onConfirm: () => onNavigatePricing(),
      });
      return;
    }

    setActionLoading(true);
    setProjectData({
      ...projectData,
      status: "PROCESSING",
      tagsMatrix: projectData.tagsMatrix.map((t) => ({ ...t, currentRank: null })),
    });

    try {
      await analyticsService.analyzeProject(
        selectedProjectId,
        projectData.tagsMatrix.map((t) => t.tag),
      );
      setIsPolling(true);
      showToast("Анализ позиций запущен", "info");
    } catch (e) {
      showToast("Ошибка при запуске анализа", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleImport = async (url: string, customTags?: string[]) => {
    setActionLoading(true);
    try {
      const newProject = await analyticsService.importCase(url);
      const newId = newProject.id;
      setSelectedProjectId(newId);
      setIsAddingNew(false);

      await analyticsService.analyzeProject(newId, customTags);
      await refreshData(newId, true);
      fireConfetti();
      showToast("Проект успешно подключен и отправлен на анализ!", "success");
    } catch (err) {
      showToast("Не удалось импортировать кейс. Проверьте ссылку.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddCustomTags = async (tagsString: string) => {
    if (isDemoMode) {
      showToast(t("dashboard.demo.restricted"), "warning");
      return;
    }

    if (!planLimits.hasCustomTags) {
      showToast("Добавление кастомных тегов доступно на тарифах Daily Fresh и Pro Stream", "warning");
      return;
    }

    if (!selectedProjectId || !hasEnoughBalance) {
      showToast("Недостаточно баланса для добавления тегов", "warning");
      return;
    }

    setActionLoading(true);
    try {
      const tags = tagsString
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await analyticsService.analyzeProject(selectedProjectId, tags);
      setIsPolling(true);
      showToast("Теги добавлены и отправлены на сканирование!", "success");
    } catch (e) {
      showToast("Не удалось добавить теги", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ADD SMART SUGGESTED TAG (1-CLICK)
  const handleAddSuggestedTag = async (tagName: string) => {
    if (isDemoMode) {
      showToast(t("dashboard.demo.restricted"), "warning");
      return;
    }

    if (!selectedProjectId) return;

    if (!hasEnoughBalance) {
      showToast("Недостаточно баланса тегов для запуска проверки", "warning");
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

    const isFree = userPlan === "FREE";
    const confirmMsg = isFree
      ? `Вы уверены, что хотите удалить проект "${selectedProjectInSidebar?.title || "кейс"}"? На бесплатном тарифе замена кейса доступна раз в 7 дней.`
      : `Вы уверены, что хотите удалить проект "${selectedProjectInSidebar?.title || "кейс"}"?`;

    confirm({
      title: "Удаление кейса",
      message: confirmMsg,
      confirmText: "Да, удалить кейс",
      cancelText: "Отмена",
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await analyticsService.deleteProject(selectedProjectId);
          showToast("Проект успешно удален", "info");

          const updatedList = await analyticsService.getUserProjects();
          setProjects(updatedList);

          if (updatedList.length > 0) {
            const nextId = updatedList[0].id;
            setSelectedProjectId(nextId);
            await refreshData(nextId, true);
          } else {
            setSelectedProjectId(null);
            setProjectData(null);
            setIsAddingNew(true);
          }
        } catch (err: any) {
          const errMsg =
            err.response?.data?.message ||
            "Не удалось удалить проект. На бесплатном тарифе удаление доступно раз в 7 дней.";
          showToast(errMsg, "error");
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const toggleAllTags = async () => {
    if (!selectedProjectId || !projectData?.tagsMatrix) return;
    const allTagNames = projectData.tagsMatrix.map((t) => t.tag);
    const newState = visibleTags.length !== allTagNames.length;
    setVisibleTags(newState ? allTagNames : []);

    if (!isDemoMode) {
      try {
        await analyticsService.toggleAllTagsOnChart(selectedProjectId, newState);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const toggleTag = async (e: React.MouseEvent, tagName: string) => {
    e.stopPropagation();
    if (!selectedProjectId) return;

    const isNowVisible = !visibleTags.includes(tagName);
    setVisibleTags((prev) => (isNowVisible ? [...prev, tagName] : prev.filter((t) => t !== tagName)));

    if (!isDemoMode) {
      try {
        await analyticsService.toggleTagOnChart(selectedProjectId, tagName, isNowVisible);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const toggleAutoUpdate = async () => {
    if (isDemoMode) {
      showToast(t("dashboard.demo.restricted"), "warning");
      return;
    }

    if (!selectedProjectId || !projectData) return;
    const newState = !projectData.activeProject.isScheduled;

    setProjectData({
      ...projectData,
      activeProject: { ...projectData.activeProject, isScheduled: newState },
    });

    try {
      await analyticsService.toggleAutoUpdate(selectedProjectId, newState);
      showToast(newState ? "Авто-обновление включено" : "Авто-обновление выключено", "info");
    } catch (err) {
      showToast("Не удалось изменить настройки расписания", "error");
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center font-black uppercase tracking-[0.5em] animate-pulse bg-behance-darkBg text-white">
        {t("common.loading")}
      </div>
    );
  }

  return (
    <div
      className={`flex h-screen overflow-hidden transition-colors duration-500 ${
        isDark ? "bg-behance-darkBg text-white" : "bg-behance-grayBg text-behance-black"
      }`}
    >
      {showWelcome && (
        <WelcomeModal
          onClose={() => setShowWelcome(false)}
          onOpenVideoTutorial={() => setIsVideoTutorialOpen(true)}
        />
      )}

      <VideoTutorialModal
        isOpen={isVideoTutorialOpen}
        onClose={() => setIsVideoTutorialOpen(false)}
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
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onSelectProject={handleProjectSelect}
        onAddNewProject={handleAddNewProjectClick}
        onNavigatePricing={onNavigatePricing}
        onNavigateLegal={onNavigateLegal}
        onNavigateAdmin={onNavigateAdmin}
        logout={logout}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto flex flex-col relative">
        {detailsLoading && (
          <div className="absolute inset-0 z-50 bg-white/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in">
            <div className="w-8 h-8 border-4 border-behance-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <div className="flex-1 p-4 md:p-8 lg:p-10 text-zinc-900 dark:text-zinc-100">
          {isAddingNew ? (
            <AddProjectView
              hasCustomTags={planLimits.hasCustomTags}
              actionLoading={actionLoading}
              onImport={handleImport}
              onTryDemo={handleTryDemo}
              onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
              onOpenVideoTutorial={() => setIsVideoTutorialOpen(true)}
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
                  onRefreshRankings={handleRefreshRankings}
                  onToggleSchedule={toggleAutoUpdate}
                  onNavigatePricing={onNavigatePricing}
                  onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
                  onOpenVideoTutorial={() => setIsVideoTutorialOpen(true)}
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
                  onCopyTags={() => {
                    const allTags = projectData.tagsMatrix.map((t) => t.tag.replace(/^#/, "").trim()).join(", ");
                    if (allTags) {
                      navigator.clipboard.writeText(allTags);
                      showToast("Все теги скопированы для настроек Behance (через запятую)!", "success");
                    }
                  }}
                />

                {/* 3. CRYSTAL CLEAR TAGS LIST */}
                <TagsMatrix
                  tags={sortedAndFilteredTags}
                  visibleTags={visibleTags}
                  suggestedTags={projectData.suggestedTags}
                  tagColors={tagColors}
                  activeFilter={activeFilter}
                  hasCustomTags={planLimits.hasCustomTags}
                  hasTrends={planLimits.hasTrends}
                  isDemoMode={isDemoMode}
                  isBusy={isSelectedProjectBusy}
                  getTrend={getTrend}
                  onFilterChange={setActiveFilter}
                  onToggleTag={toggleTag}
                  onToggleAllTags={toggleAllTags}
                  onAddCustomTags={handleAddCustomTags}
                  onAddSuggestedTag={handleAddSuggestedTag}
                  onRemoveTag={handleRemoveTag}
                  onFocusTag={setFocusedTag}
                />

                {/* 4. PROGRESSIVE DISCLOSURE: DETAILED CHARTS ACCORDION */}
                <RankingsChart
                  hasHistory={planLimits.hasHistory}
                  history={history}
                  visibleTags={visibleTags}
                  focusedTag={focusedTag}
                  tagColors={tagColors}
                  onNavigatePricing={onNavigatePricing}
                />
              </div>
            )
          )}
        </div>

        <Footer onNavigate={onNavigateLegal} />
      </div>
    </div>
  );
};
