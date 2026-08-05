import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { analyticsService, type BehanceProject, type HistoryPoint } from "../services/analyticsService";
import { useTheme } from "../context/ThemeContextInstance";
import { formatDistanceToNow, addHours } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { Footer } from "../components/Footer";

const COLORS = ["#0057ff", "#00c853", "#ff0057", "#ffab00", "#7e57c2", "#26c6da", "#ec407a", "#ff5722", "#00bcd4", "#8bc34a"];
const PLAN_HOURS = { FREE: 168, DAILY_FRESH: 72, PRO_STREAM: 24 };

interface TagMatrixItem {
  tag: string;
  currentRank: number | null;
  onChart: boolean;
}
interface ProjectData {
  tagsMatrix: TagMatrixItem[];
  tagBalance: number;
  status: string;
  plan: string;
  lastAnalyzedAt: string;
  activeProject: { id: string; isScheduled: boolean; views: number; appreciations: number; comments: number; url: string; title: string };
}

const CustomTooltip = ({ active, payload, label, isDark }: any) => {
  if (active && payload && payload.length) {
    const sortedPayload = [...payload].sort((a, b) => (Number(a.value) || 999) - (Number(b.value) || 999));
    return (
      <div
        className={`p-6 rounded-[2.5rem] border backdrop-blur-xl shadow-2xl ${isDark ? "bg-black/80 border-white/10" : "bg-white/90 border-gray-100"}`}
      >
        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-40">{label}</p>
        <div className="space-y-3">
          {sortedPayload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.stroke }}></div>
                <span className="text-[11px] font-bold uppercase tracking-tight opacity-80">{entry.name}:</span>
              </div>
              <span
                className={`text-[11px] font-black ${Number(entry.value) <= 10 ? "text-green-500" : isDark ? "text-white" : "text-black"}`}
              >
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

const WelcomeModal: React.FC<{ onClose: () => void; isDark: boolean }> = ({ onClose, isDark }) => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className={`max-w-2xl w-full p-12 rounded-[3.5rem] border shadow-2xl transition-all ${isDark ? "bg-behance-darkCard border-white/5 shadow-black" : "bg-white border-behance-border"}`}
      >
        <h2 className="text-4xl font-black uppercase tracking-tighter mb-10 italic text-behance-blue">{t("onboarding.title")}</h2>
        <div className="grid gap-8 mb-12 text-behance-black dark:text-white">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex gap-6">
              <span className="text-4xl font-black opacity-10 italic">{num}</span>
              <div className="space-y-1">
                <h4 className="font-black uppercase text-sm tracking-widest">{t(`onboarding.step${num}.h`)}</h4>
                <p className="text-sm opacity-50 leading-relaxed">{t(`onboarding.step${num}.p`)}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full py-6 rounded-2xl bg-behance-blue text-white font-black uppercase text-[10px] tracking-[0.3em] shadow-xl shadow-blue-500/20 hover:scale-105 transition-all"
        >
          {t("onboarding.button")}
        </button>
      </div>
    </div>
  );
};

interface DashboardProps {
  onNavigatePricing: () => void;
  onNavigateLegal: (view: any) => void;
  logout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigatePricing, onNavigateLegal, logout }) => {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const isDark = theme === "dark";
  const chartRef = useRef<HTMLDivElement>(null);
  const dateLocale = i18n.language === "ru" ? ru : enUS;

  const [showWelcome, setShowWelcome] = useState(!localStorage.getItem("onboarding_complete"));
  const [projects, setProjects] = useState<BehanceProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [data, setData] = useState<ProjectData | null>(null);
  const [history, setHistory] = useState<Record<string, HistoryPoint[]>>({});
  const [visibleTags, setVisibleTags] = useState<string[]>([]);
  const [focusedTag, setFocusedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [newTagsInput, setNewTagsInput] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "top10" | "potential" | "lost">("all");
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [showTagsInput, setShowTagsInput] = useState(false);

  const userId = localStorage.getItem("userId") || "";

  const stats = useMemo(() => {
    const tags = data?.tagsMatrix || [];
    const inSearch = tags.filter((t) => typeof t.currentRank === "number" && t.currentRank > 0);
    return {
      top10: tags.filter((t) => typeof t.currentRank === "number" && t.currentRank >= 1 && t.currentRank <= 10).length,
      potential: tags.filter((t) => typeof t.currentRank === "number" && t.currentRank > 10 && t.currentRank <= 30).length,
      total: tags.length,
      visibility: tags.length > 0 ? Math.round((inSearch.length / tags.length) * 100) : 0,
    };
  }, [data]);

  const selectedProjectInSidebar = useMemo(() => projects.find((p) => p.id === selectedProjectId) || null, [projects, selectedProjectId]);
  const currentCost = useMemo(() => data?.tagsMatrix?.length || 0, [data]);
  const hasEnoughBalance = useMemo(() => (data?.tagBalance || 0) >= currentCost, [data, currentCost]);

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
    const tags = data?.tagsMatrix || [];
    let result = [...tags];
    if (activeFilter === "top10")
      result = result.filter((t) => typeof t.currentRank === "number" && t.currentRank >= 1 && t.currentRank <= 10);
    if (activeFilter === "potential")
      result = result.filter((t) => typeof t.currentRank === "number" && t.currentRank > 10 && t.currentRank <= 30);
    if (activeFilter === "lost") result = result.filter((t) => t.currentRank === null || t.currentRank <= 0);
    return result.sort((a, b) => {
      const rankA = a.currentRank === null || a.currentRank <= 0 ? 999 : a.currentRank;
      const rankB = b.currentRank === null || b.currentRank <= 0 ? 999 : b.currentRank;
      return rankA - rankB;
    });
  }, [data, activeFilter]);

  const tagColors = useMemo(() => {
    const map: Record<string, string> = {};
    data?.tagsMatrix?.forEach((item, idx) => {
      map[item.tag] = COLORS[idx % COLORS.length];
    });
    return map;
  }, [data]);

  const chartData = useMemo(() => {
    const dates = new Set<string>();
    Object.values(history).forEach((th) => th.forEach((p) => dates.add(p.date)));
    return Array.from(dates)
      .sort()
      .map((date) => {
        const entry: any = { date };
        Object.keys(history).forEach((tagName) => {
          const point = history[tagName].find((pt) => pt.date === date);
          if (point) entry[tagName] = point.rank;
        });
        return entry;
      });
  }, [history]);

  const isSelectedProjectBusy = useMemo(() => data?.status && data.status !== "IDLE", [data]);
  const isChartEmpty = useMemo(
    () => (visibleTags.length === 0 && !focusedTag) || chartData.length === 0,
    [visibleTags, focusedTag, chartData],
  );

  const nextUpdateInfo = useMemo(() => {
    if (!data?.lastAnalyzedAt || !data?.plan) return null;
    const interval = (PLAN_HOURS as any)[data.plan];
    const nextDate = addHours(new Date(data.lastAnalyzedAt), interval);
    return formatDistanceToNow(nextDate, { addSuffix: true, locale: dateLocale });
  }, [data, dateLocale]);

  const refreshData = useCallback(
    async (targetId: string, isInitialLoad = false) => {
      try {
        const [detailsRes, historyRes, listRes] = await Promise.all([
          analyticsService.getProjectDetails(targetId),
          analyticsService.getProjectHistory(targetId),
          analyticsService.getUserProjects(userId),
        ]);
        const prevStatus = data?.status;
        if (prevStatus === "PROCESSING" && detailsRes.status === "IDLE" && visibleTags.length === 0) {
          const allTags = detailsRes.tagsMatrix.map((t: any) => t.tag);
          setVisibleTags(allTags);
          if (!isDemoMode) analyticsService.toggleAllTagsOnChart(targetId, true);
        }
        setProjects(listRes || []);
        setData(detailsRes);
        setHistory(historyRes || {});
        if (isInitialLoad && detailsRes.tagsMatrix) {
          const active = detailsRes.tagsMatrix.filter((t: any) => t.onChart).map((t: any) => t.tag);
          setVisibleTags(active);
        }
        setIsPolling(listRes.some((p: any) => p.analysisStatus !== "IDLE") || detailsRes.status !== "IDLE");
      } catch (e) {
        console.error(e);
      }
    },
    [userId, data?.status, visibleTags.length, isDemoMode],
  );

  useEffect(() => {
    const init = async () => {
      const list = await analyticsService.getUserProjects(userId);
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
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    let interval: any;
    if (isPolling && selectedProjectId) {
      interval = setInterval(() => refreshData(selectedProjectId), 3000);
    }
    return () => clearInterval(interval);
  }, [isPolling, selectedProjectId, refreshData]);

  const handleTryDemo = async () => {
    setDetailsLoading(true);
    try {
      const demo = await analyticsService.getDemoProject();
      if (demo && demo.id) {
        setSelectedProjectId(demo.id);
        setIsDemoMode(true);
        setIsAddingNew(false);
        await refreshData(demo.id, true);
      }
    } catch (e) {
      alert("Demo not found");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag).then(() => {
      setCopiedTag(tag);
      setTimeout(() => setCopiedTag(null), 1500);
    });
  };

  const handleCopyAll = () => {
    const text = sortedAndFilteredTags.map((t) => t.tag).join(", ");
    navigator.clipboard.writeText(text).then(() => alert(t("dashboard.matrix.copied")));
  };

  const handleProjectSelect = async (id: string) => {
    if (id === selectedProjectId) return;
    setSelectedProjectId(id);
    setIsDemoMode(false);
    setDetailsLoading(true);
    setIsAddingNew(false);
    setFocusedTag(null);
    setVisibleTags([]);
    try {
      await refreshData(id, true);
    } catch (e) {}
    setDetailsLoading(false);
  };

  const toggleLanguage = () => i18n.changeLanguage(i18n.language === "ru" ? "en" : "ru");

  const toggleAutoUpdate = async () => {
    if (isDemoMode) return alert(t("dashboard.demo.restricted"));
    if (!selectedProjectId || !data) return;
    const newState = !data.activeProject.isScheduled;
    setData({ ...data, activeProject: { ...data.activeProject, isScheduled: newState } });
    try {
      await analyticsService.toggleAutoUpdate(selectedProjectId, newState);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAllTags = async () => {
    if (!selectedProjectId || !data?.tagsMatrix) return;
    const allTagNames = data.tagsMatrix.map((t) => t.tag);
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

  const handleAddCustomTags = async () => {
    if (isDemoMode) return alert(t("dashboard.demo.restricted"));
    if (!selectedProjectId || !newTagsInput.trim() || !hasEnoughBalance) return;
    setActionLoading(true);
    try {
      const tags = newTagsInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      await analyticsService.analyzeProject(selectedProjectId, tags);
      setNewTagsInput("");
      setIsPolling(true);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefreshRankings = async () => {
    if (isDemoMode) return alert(t("dashboard.demo.restricted"));
    if (!selectedProjectId || actionLoading || isSelectedProjectBusy || !data?.tagsMatrix) return;
    if (!hasEnoughBalance) {
      if (confirm(`${t("dashboard.errors.lowBalance")}. ${t("dashboard.errors.lowBalanceAction")}?`)) onNavigatePricing();
      return;
    }
    setActionLoading(true);
    setData({ ...data, status: "PROCESSING", tagsMatrix: data.tagsMatrix.map((t) => ({ ...t, currentRank: null })) });
    try {
      await analyticsService.analyzeProject(
        selectedProjectId,
        data.tagsMatrix.map((t) => t.tag),
      );
      setIsPolling(true);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || actionLoading) return;
    setActionLoading(true);
    try {
      const res = await analyticsService.importCase(urlInput, userId);
      const newId = (res.data || res).id;
      setSelectedProjectId(newId);
      setIsAddingNew(false);
      const customTags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      await analyticsService.analyzeProject(newId, customTags);
      await refreshData(newId, true);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
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

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center font-black uppercase tracking-[0.5em] animate-pulse bg-behance-darkBg text-white">
        {t("common.loading")}
      </div>
    );

  return (
    <div
      className={`flex h-screen overflow-hidden transition-colors duration-500 ${isDark ? "bg-behance-darkBg text-white" : "bg-behance-grayBg text-behance-black"}`}
    >
      {showWelcome && (
        <WelcomeModal
          onClose={() => {
            setShowWelcome(false);
            localStorage.setItem("onboarding_complete", "true");
          }}
          isDark={isDark}
        />
      )}

      <div
        className={`w-80 border-r flex flex-col z-10 transition-colors ${isDark ? "bg-behance-darkCard border-white/5 shadow-2xl" : "bg-white border-behance-border shadow-sm"}`}
      >
        <div className="p-10 border-b border-behance-border dark:border-white/5 text-center relative">
          <button
            onClick={toggleLanguage}
            className={`absolute top-4 left-4 text-[9px] font-black w-8 h-8 rounded-full shadow-sm ${isDark ? "bg-white/5 text-blue-400" : "bg-gray-100 text-gray-500"}`}
          >
            {i18n.language.toUpperCase().substring(0, 2)}
          </button>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">BeRanked</h1>
          <div className="h-1 w-8 bg-behance-blue mx-auto mt-3 rounded-full shadow-[0_0_15px_rgba(0,87,255,0.4)]"></div>
          <button
            onClick={toggleTheme}
            className={`absolute top-4 right-4 text-xs w-8 h-8 rounded-full shadow-sm ${isDark ? "bg-white/5 text-yellow-400" : "bg-gray-100 text-gray-400"}`}
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <div
            onClick={() => {
              setIsAddingNew(true);
              setSelectedProjectId(null);
              setShowTagsInput(false);
              setIsDemoMode(false);
            }}
            className={`p-6 rounded-4xl border-2 border-dashed flex items-center justify-center gap-3 cursor-pointer transition-all ${isAddingNew ? "border-behance-blue bg-behance-blue/5 text-behance-blue" : "border-behance-border text-behance-muted hover:border-behance-blue dark:border-white/10"}`}
          >
            <span className="text-lg">＋</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{t("sidebar.newProject")}</span>
          </div>
          {projects.map((p: any) => {
            const status = p.analysisStatus;
            const isActive = selectedProjectId === p.id && !isDemoMode;
            return (
              <div
                key={p.id}
                onClick={() => handleProjectSelect(p.id)}
                className={`p-6 rounded-[2.2rem] cursor-pointer transition-all relative border ${isActive ? "bg-behance-blue border-behance-blue text-white shadow-xl scale-[1.03]" : isDark ? "bg-white/5 border-transparent text-gray-400 hover:bg-white/10" : "bg-white border-behance-border hover:shadow-md transition-all"}`}
              >
                {status !== "IDLE" && (
                  <div
                    className={`absolute top-5 right-7 w-2.5 h-2.5 rounded-full ${status === "PENDING" ? "bg-amber-400 shadow-[0_0_10px_#fbbf24]" : "bg-white animate-ping"}`}
                  />
                )}
                <div className="text-[11px] font-black truncate uppercase pr-6">{p.title || "..."}</div>
                <div className={`text-[8px] mt-2 font-bold uppercase tracking-widest ${isActive ? "text-white/50" : "opacity-40"}`}>
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
        <div className="p-6 border-t border-behance-border dark:border-white/5 space-y-2 text-center">
          {data && (
            <div
              className={`mb-4 p-4 rounded-2xl border text-center transition-all ${isDark ? "bg-white/5 border-white/5" : "bg-behance-grayBg border-behance-border"}`}
            >
              <span className="text-[9px] font-black uppercase opacity-40 block mb-1">{t("dashboard.meta.plan")}</span>
              <span
                className={`text-xs font-black uppercase tracking-widest ${isDemoMode ? "text-amber-400 animate-pulse" : "text-behance-blue"}`}
              >
                {isDemoMode ? "PRO STREAM (DEMO)" : data.plan}
              </span>
            </div>
          )}
          <button
            onClick={() => onNavigateLegal("help")}
            className="w-full py-3 mb-2 rounded-xl bg-behance-blue/5 text-behance-blue text-[10px] font-black uppercase tracking-widest hover:bg-behance-blue/10 flex items-center justify-center gap-2"
          >
            <span className="text-base leading-none">❓</span> {t("help.title")}
          </button>
          <button
            onClick={onNavigatePricing}
            className="w-full py-4 rounded-2xl border border-behance-blue/20 bg-white dark:bg-white/5 text-[10px] font-black uppercase tracking-widest transition-all"
          >
            {t("sidebar.managePlan")}
          </button>
          <button
            onClick={logout}
            className="w-full py-2 text-[10px] font-black uppercase tracking-widest opacity-20 hover:opacity-100 transition-opacity"
          >
            {t("sidebar.logout")}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col relative">
        {detailsLoading && (
          <div className="absolute inset-0 z-50 bg-white/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in">
            <div className="w-8 h-8 border-4 border-behance-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <div className="flex-1 p-8 md:p-16 text-behance-black dark:text-white">
          {isAddingNew ? (
            <div className="max-w-2xl mx-auto mt-12 animate-in fade-in zoom-in-95 duration-500 text-center">
              <h2 className="text-5xl font-black uppercase tracking-tighter italic mb-4">{t("dashboard.emptyState.title")}</h2>
              <p className="text-sm opacity-40 uppercase font-bold tracking-widest mb-12 px-10 leading-relaxed">
                {t("dashboard.emptyState.subtitle")}
              </p>
              <div
                className={`p-12 rounded-[4rem] border shadow-2xl transition-all text-left ${isDark ? "bg-behance-darkCard border-white/5" : "bg-white border-behance-border"}`}
              >
                <form onSubmit={handleImport} className="space-y-6">
                  <input
                    className={`w-full rounded-3xl px-8 py-7 text-sm font-bold outline-none border transition-all ${isDark ? "bg-white/5 border-transparent text-white focus:border-blue-500 shadow-inner" : "bg-behance-grayBg border-transparent focus:border-behance-blue shadow-inner"}`}
                    placeholder={t("dashboard.init.urlPlaceholder")}
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    required
                  />
                  {!showTagsInput && (
                    <button
                      type="button"
                      onClick={() => setShowTagsInput(true)}
                      className="text-[10px] font-black uppercase text-behance-blue tracking-widest hover:opacity-70 transition-all"
                    >
                      {t("dashboard.init.addCustomTags")}
                    </button>
                  )}
                  {showTagsInput && (
                    <textarea
                      className={`w-full rounded-3xl px-8 py-6 text-xs font-bold outline-none min-h-37.5 border transition-all ${isDark ? "bg-white/5 border-transparent text-white focus:border-blue-500 shadow-inner" : "bg-behance-grayBg border-transparent focus:border-behance-blue shadow-inner"}`}
                      placeholder={t("dashboard.init.tagsPlaceholder")}
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                    />
                  )}
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full bg-behance-blue text-white py-7 rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    {actionLoading ? t("dashboard.init.loading") : t("dashboard.init.button")}
                  </button>
                </form>
              </div>
              <button
                onClick={handleTryDemo}
                className="mt-8 text-[10px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity"
              >
                💡 {t("dashboard.emptyState.demoBtn")}
              </button>
            </div>
          ) : (
            selectedProjectId &&
            data && (
              <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div
                    onClick={() => setActiveFilter("top10")}
                    className={`p-6 rounded-[2.5rem] border flex flex-col gap-2 cursor-pointer transition-all hover:scale-105 ${activeFilter === "top10" ? "border-green-500 bg-green-500/5 shadow-lg" : isDark ? "bg-behance-darkCard border-white/5 shadow-inner" : "bg-white border-behance-border shadow-sm"}`}
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Top 10</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-green-500">{stats.top10}</span>
                    </div>
                  </div>
                  <div
                    onClick={() => setActiveFilter("potential")}
                    className={`p-6 rounded-[2.5rem] border flex flex-col gap-2 cursor-pointer transition-all hover:scale-105 ${activeFilter === "potential" ? "border-behance-blue bg-behance-blue/5 shadow-lg" : isDark ? "bg-behance-darkCard border-white/5 shadow-inner" : "bg-white border-behance-border shadow-sm"}`}
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Potential</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-behance-blue">{stats.potential}</span>
                    </div>
                  </div>
                  <div
                    className={`p-6 rounded-[2.5rem] border transition-all ${isDark ? "bg-behance-darkCard border-white/5 shadow-inner" : "bg-white border-behance-border shadow-sm"}`}
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-30">{t("dashboard.stats.views")}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black">{(data.activeProject?.views || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <div
                    className={`p-6 rounded-[2.5rem] border transition-all ${isDark ? "bg-behance-darkCard border-white/5 shadow-inner" : "bg-white border-behance-border shadow-sm"}`}
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-30">{t("dashboard.stats.likes")}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-pink-500">{(data.activeProject?.appreciations || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <div
                    className={`p-6 rounded-[2.5rem] border transition-all ${isDark ? "bg-behance-darkCard border-white/5 shadow-inner" : "bg-white border-behance-border shadow-sm"}`}
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-30">{t("dashboard.stats.comments")}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-behance-blue">{(data.activeProject?.comments || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-start border-b border-behance-border dark:border-white/5 pb-12">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <h2 className="text-6xl font-black tracking-tighter uppercase leading-[0.85]">{selectedProjectInSidebar?.title}</h2>
                      {isDemoMode && (
                        <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest animate-pulse">
                          {t("dashboard.demo.badge")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <a
                        href={selectedProjectInSidebar?.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-black text-behance-blue uppercase border-b-2 border-behance-blue/20 transition-all"
                      >
                        {t("common.source")}
                      </a>
                      <button
                        onClick={toggleAutoUpdate}
                        className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl transition-all ${data?.activeProject?.isScheduled ? "bg-green-500/10 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]" : "bg-gray-500/10 text-gray-500"}`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${data?.activeProject?.isScheduled ? "bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" : "bg-gray-500"}`}
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {t("dashboard.header.robot")}:{" "}
                          {data?.activeProject?.isScheduled ? t("dashboard.header.robotActive") : t("dashboard.header.robotOff")}
                        </span>
                      </button>
                      {!isDemoMode && (
                        <div
                          onClick={onNavigatePricing}
                          className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase border transition-all cursor-pointer ${hasEnoughBalance ? (isDark ? "bg-white/5 text-gray-400" : "bg-gray-100 text-gray-200") : isDark ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-red-50 text-red-600 border-red-100"}`}
                        >
                          {t("dashboard.meta.balance")}: {data.tagBalance} {!hasEnoughBalance && "⚠️"}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleRefreshRankings}
                    disabled={actionLoading || isSelectedProjectBusy}
                    className={`px-12 py-6 rounded-[2rem] text-[10px] font-black uppercase shadow-2xl transition-all hover:scale-105 active:scale-95 ${isDemoMode ? "opacity-20 cursor-not-allowed" : !hasEnoughBalance && !isSelectedProjectBusy ? "bg-gray-400 text-white opacity-50" : isSelectedProjectBusy ? "bg-blue-600 text-white animate-pulse" : isDark ? "bg-white text-black shadow-white/5" : "bg-black text-white shadow-black/20"}`}
                  >
                    {isSelectedProjectBusy
                      ? data?.status === "PENDING"
                        ? t("dashboard.header.updateBtnPending")
                        : t("dashboard.header.updateBtnProcessing")
                      : !hasEnoughBalance
                        ? t("dashboard.errors.lowBalance")
                        : t("dashboard.header.updateBtn")}
                  </button>
                </div>

                <div
                  ref={chartRef}
                  className={`p-14 rounded-[4rem] border relative overflow-hidden transition-all duration-500 flex items-center justify-center ${isDark ? "bg-behance-darkCard border-white/5 shadow-inner" : "bg-white border-behance-border shadow-2xl shadow-blue-900/5"}`}
                >
                  <div className="h-112.5 w-full flex items-center justify-center">
                    {isChartEmpty ? (
                      <div className="text-center animate-in fade-in zoom-in-95 duration-700">
                        <div className="text-5xl mb-6 opacity-20">📊</div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] opacity-30 leading-loose whitespace-pre-line">
                          {t("dashboard.chart.empty")}
                        </h3>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={isDark ? "rgba(255,255,255,0.03)" : "#f0f0f0"} />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10, fontWeight: "900", fill: isDark ? "#444" : "#bbb" }}
                            dy={20}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            reversed
                            tick={{ fontSize: 10, fontWeight: "900", fill: isDark ? "#444" : "#bbb" }}
                            axisLine={false}
                            tickLine={false}
                            domain={[1, "auto"]}
                          />
                          <Tooltip
                            content={<CustomTooltip isDark={isDark} />}
                            cursor={{ stroke: isDark ? "rgba(255,255,255,0.1)" : "#eee", strokeWidth: 2 }}
                          />
                          {Object.keys(history).map(
                            (tag) =>
                              visibleTags.includes(tag) && (
                                <Line
                                  key={tag}
                                  type="monotone"
                                  dataKey={tag}
                                  name={tag}
                                  stroke={tagColors[tag]}
                                  strokeWidth={focusedTag === tag ? 5 : 2}
                                  strokeOpacity={focusedTag ? (focusedTag === tag ? 1 : 0.15) : 1}
                                  dot={focusedTag === tag ? { r: 5, fill: tagColors[tag], strokeWidth: 0 } : false}
                                  activeDot={{ r: 6, strokeWidth: 0 }}
                                  connectNulls
                                  animationDuration={600}
                                />
                              ),
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div
                  className={`rounded-[3.5rem] border overflow-hidden transition-all ${isDark ? "bg-behance-darkCard border-white/5 shadow-inner" : "bg-white border-behance-border shadow-lg"}`}
                >
                  <div className="px-10 py-8 border-b border-behance-border dark:border-white/5 flex flex-wrap justify-between items-center bg-gray-50/30 dark:bg-white/5 gap-6">
                    <div className="flex items-center gap-6">
                      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 italic">{t("dashboard.matrix.title")}</h3>
                      <div className="flex gap-2 p-1 bg-behance-grayBg dark:bg-white/5 rounded-xl">
                        {(["all", "top10", "potential", "lost"] as const).map((f) => (
                          <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeFilter === f ? "bg-white dark:bg-behance-blue text-black dark:text-white shadow-sm" : "opacity-30 hover:opacity-100"}`}
                          >
                            {t(`dashboard.matrix.filters.${f}`)}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={handleCopyAll}
                        className="text-[10px] font-black uppercase text-behance-blue border-b-2 border-behance-blue/20 pb-1 hover:border-behance-blue transition-all"
                      >
                        {t("dashboard.matrix.copyAll")}
                      </button>
                      <button
                        onClick={toggleAllTags}
                        className="text-[10px] font-black uppercase text-gray-400 hover:text-behance-blue transition-all"
                      >
                        {visibleTags.length === (data?.tagsMatrix?.length || 0)
                          ? t("dashboard.matrix.hideAll")
                          : t("dashboard.matrix.showAll")}
                      </button>
                    </div>
                    <div className="flex gap-4">
                      <input
                        className={`rounded-xl px-4 py-2 text-[10px] font-bold outline-none w-48 border transition-all ${isDark ? "bg-white/5 border-transparent text-white focus:bg-white/10" : "bg-white border-gray-100 focus:border-blue-200"}`}
                        placeholder={t("dashboard.matrix.inputPlaceholder")}
                        value={newTagsInput}
                        onChange={(e) => setNewTagsInput(e.target.value)}
                        disabled={isDemoMode}
                      />
                      <button
                        onClick={handleAddCustomTags}
                        disabled={isDemoMode || actionLoading || isSelectedProjectBusy}
                        className="bg-behance-blue text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase shadow-lg transition-all"
                      >
                        {t("dashboard.matrix.addBtn")}
                      </button>
                    </div>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-behance-border dark:divide-white/5">
                      {sortedAndFilteredTags.map((item: TagMatrixItem, idx: number) => {
                        const isVisible = visibleTags.includes(item.tag);
                        const rank = item.currentRank;
                        const isTop = typeof rank === "number" && rank >= 1 && rank <= 10;
                        const trend = getTrend(item.tag, rank);
                        const isChecking = rank === null && isSelectedProjectBusy;
                        return (
                          <tr
                            key={idx}
                            onMouseEnter={() => setFocusedTag(item.tag)}
                            onMouseLeave={() => setFocusedTag(null)}
                            className={`transition-colors duration-200 group ${isDark ? "hover:bg-white/5 text-white" : "hover:bg-behance-grayBg text-behance-black"}`}
                          >
                            <td className="px-10 py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tagColors[item.tag] }}></div>
                                <span
                                  className={`text-[13px] font-black uppercase tracking-tight transition-opacity ${isVisible ? "opacity-100" : "opacity-15"}`}
                                >
                                  #{item.tag}
                                </span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                  <button
                                    onClick={() => handleCopyTag(item.tag)}
                                    className={`p-1.5 rounded-lg transition-all ${copiedTag === item.tag ? "bg-green-500 text-white" : "bg-behance-blue/10 text-behance-blue"}`}
                                  >
                                    {" "}
                                    {copiedTag === item.tag ? (
                                      "✓"
                                    ) : (
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={3}
                                          d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                                        />
                                      </svg>
                                    )}{" "}
                                  </button>
                                  <a
                                    href={`https://www.behance.net/search/projects?search=${encodeURIComponent(item.tag)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 rounded-lg bg-gray-500/10 text-gray-500 hover:bg-behance-blue hover:text-white transition-all"
                                  >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                      />
                                    </svg>
                                  </a>
                                </div>
                              </div>
                            </td>
                            <td className="px-10 py-5 text-center">
                              {" "}
                              {isChecking ? (
                                <span className="text-blue-500 animate-pulse text-[9px] font-black uppercase italic tracking-widest">
                                  {t("dashboard.matrix.rankChecking")}
                                </span>
                              ) : !rank || rank <= 0 ? (
                                <span className="text-gray-400 text-[11px] font-black uppercase">{t("dashboard.matrix.rankOutOfTop")}</span>
                              ) : (
                                <span className={`text-[13px] font-black ${isTop ? "text-green-500" : ""}`}>#{rank}</span>
                              )}{" "}
                            </td>
                            <td className="px-10 py-5 text-center font-black">
                              {" "}
                              {!isChecking && trend !== 0 && trend !== null && (
                                <span className={`text-[10px] uppercase ${trend > 0 ? "text-green-500" : "text-red-500"}`}>
                                  {" "}
                                  {trend > 0 ? `▲ ${trend}` : `▼ ${Math.abs(trend)}`}{" "}
                                </span>
                              )}{" "}
                              {(isChecking || trend === 0 || trend === null) && <span className="opacity-10 font-black">•</span>}{" "}
                            </td>
                            <td className="px-10 py-5 text-right flex items-center justify-end gap-6">
                              {!isChecking &&
                                (() => {
                                  if (isTop)
                                    return (
                                      <span className="px-3 py-1 rounded-full text-[8px] font-black bg-green-500 text-white uppercase tracking-widest shadow-lg shadow-green-500/20">
                                        {t("dashboard.matrix.statuses.top")}
                                      </span>
                                    );
                                  if (rank && rank > 0) {
                                    if (trend > 0)
                                      return (
                                        <span className="px-3 py-1 rounded-full text-[8px] font-black bg-behance-blue/10 text-behance-blue uppercase tracking-widest">
                                          {t("dashboard.matrix.statuses.growth")}
                                        </span>
                                      );
                                    if (trend < 0)
                                      return (
                                        <span className="px-3 py-1 rounded-full text-[8px] font-black bg-red-500/10 text-red-500 uppercase tracking-widest">
                                          {t("dashboard.matrix.statuses.falling")}
                                        </span>
                                      );
                                    return (
                                      <span className="px-3 py-1 rounded-full text-[8px] font-black bg-gray-500/10 text-gray-500 uppercase tracking-widest">
                                        {t("dashboard.matrix.statuses.stable")}
                                      </span>
                                    );
                                  }
                                  return null;
                                })()}
                              <button
                                onClick={(e) => toggleTag(e, item.tag)}
                                className={`w-10 h-5 rounded-full relative transition-all duration-500 ${isVisible ? "bg-behance-blue shadow-lg shadow-blue-500/40" : isDark ? "bg-white/5" : "bg-gray-200"}`}
                              >
                                <div
                                  className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 ${isVisible ? "left-6" : "left-1"}`}
                                />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}
        </div>
        <Footer onNavigate={onNavigateLegal} />
      </div>
    </div>
  );
};
