import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { analyticsService, type BehanceProject, type HistoryPoint } from "../services/analyticsService";
import { useTheme } from "../context/ThemeContextInstance";
import { formatDistanceToNow, addHours } from "date-fns";
import { ru } from "date-fns/locale";

const COLORS = ["#0057ff", "#00c853", "#ff0057", "#ffab00", "#7e57c2", "#26c6da", "#ec407a", "#ff5722", "#00bcd4", "#8bc34a"];

const PLAN_HOURS = {
  FREE: 168,
  DAILY_FRESH: 72,
  PRO_STREAM: 24,
};

// --- КОМПОНЕНТ УМНОГО ТУЛТИПА ---
const CustomTooltip = ({ active, payload, label, isDark }: any) => {
  if (active && payload && payload.length) {
    const sortedPayload = [...payload].sort((a, b) => (a.value || 999) - (b.value || 999));
    const isMultiColumn = sortedPayload.length > 10;

    return (
      <div
        className={`p-6 rounded-[2.5rem] border backdrop-blur-xl shadow-2xl transition-all duration-300 ${isDark ? "bg-black/80 border-white/10" : "bg-white/90 border-gray-100"}`}
      >
        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-40">{label}</p>
        <div className={`grid ${isMultiColumn ? "grid-cols-2 gap-x-10" : "grid-cols-1"} gap-y-3`}>
          {sortedPayload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full shadow-sm" style={{ backgroundColor: entry.stroke }}></div>
                <span className="text-[11px] font-bold uppercase tracking-tight opacity-80">{entry.name}:</span>
              </div>
              <span className={`text-[11px] font-black ${entry.value <= 10 ? "text-green-500" : isDark ? "text-white" : "text-black"}`}>
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

interface DashboardProps {
  onNavigatePricing: () => void;
  logout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigatePricing, logout }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const chartRef = useRef<HTMLDivElement>(null);

  // --- ДАННЫЕ ---
  const [projects, setProjects] = useState<BehanceProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<Record<string, HistoryPoint[]>>({});

  // --- ИНТЕРАКТИВ ---
  const [visibleTags, setVisibleTags] = useState<string[]>([]);
  const [focusedTag, setFocusedTag] = useState<string | null>(null);

  // --- СОСТОЯНИЯ UI ---
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  // --- ВВОД ---
  const [urlInput, setUrlInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [newTagsInput, setNewTagsInput] = useState("");
  const [error, setError] = useState("");

  const userId = localStorage.getItem("userId") || "";

  const selectedProjectInSidebar = useMemo(() => projects.find((p) => p.id === selectedProjectId) || null, [projects, selectedProjectId]);

  const tagColors = useMemo(() => {
    const map: Record<string, string> = {};
    if (data?.tagsMatrix) {
      data.tagsMatrix.forEach((item: any, idx: number) => {
        map[item.tag] = COLORS[idx % COLORS.length];
      });
    }
    return map;
  }, [data?.tagsMatrix]);

  const chartData = useMemo(() => {
    const dates = new Set<string>();
    Object.values(history).forEach((th) => {
      if (Array.isArray(th)) th.forEach((p: any) => dates.add(p.date));
    });
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

  const isSelectedProjectBusy = useMemo(() => data?.status && data.status !== "IDLE", [data?.status]);

  // ПРОВЕРКА ПУСТОТЫ ГРАФИКА
  const isChartEmpty = useMemo(
    () => (visibleTags.length === 0 && !focusedTag) || chartData.length === 0,
    [visibleTags, focusedTag, chartData],
  );

  const nextUpdateInfo = useMemo(() => {
    if (!data?.lastAnalyzedAt || !data?.plan) return null;
    const interval = (PLAN_HOURS as any)[data.plan];
    const nextDate = addHours(new Date(data.lastAnalyzedAt), interval);
    return formatDistanceToNow(nextDate, { addSuffix: true, locale: ru });
  }, [data]);

  const refreshData = useCallback(
    async (targetId: string, isInitialLoad = false) => {
      try {
        const [detailsRes, historyRes, listRes] = await Promise.all([
          analyticsService.getProjectDetails(targetId),
          analyticsService.getProjectHistory(targetId),
          analyticsService.getUserProjects(userId),
        ]);

        if (targetId !== selectedProjectId && !isInitialLoad) return;

        setProjects(listRes || []);
        if (detailsRes.tagsMatrix) {
          detailsRes.tagsMatrix.sort((a: any, b: any) => a.tag.localeCompare(b.tag));
          if (isInitialLoad) {
            const activeFromDb = detailsRes.tagsMatrix.filter((t: any) => t.onChart).map((t: any) => t.tag);
            setVisibleTags(activeFromDb);
          }
        }
        setData(detailsRes);
        setHistory(historyRes || {});
        setIsPolling(detailsRes.status !== "IDLE" || listRes.some((p: any) => p.analysisStatus !== "IDLE"));
      } catch (e) {
        console.error(e);
      }
    },
    [selectedProjectId, userId],
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPolling && selectedProjectId) {
      interval = setInterval(() => refreshData(selectedProjectId), 3000);
    }
    return () => clearInterval(interval);
  }, [isPolling, selectedProjectId, refreshData]);

  const handleProjectSelect = async (id: string) => {
    if (id === selectedProjectId) return;
    setSelectedProjectId(id);
    setDetailsLoading(true);
    setIsAddingNew(false);
    setFocusedTag(null);
    setVisibleTags([]);
    try {
      await refreshData(id, true);
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const list = await analyticsService.getUserProjects(userId);
      if (list && list.length > 0) {
        setSelectedProjectId(list[0].id);
        await refreshData(list[0].id, true);
      } else {
        setIsAddingNew(true);
      }
      setLoading(false);
    };
    init();
  }, [userId]);

  const toggleAllTags = async () => {
    if (!selectedProjectId || !data?.tagsMatrix) return;
    const allTagNames = data.tagsMatrix.map((t: any) => t.tag);
    const newState = visibleTags.length !== allTagNames.length;
    setVisibleTags(newState ? allTagNames : []);
    try {
      await analyticsService.toggleAllTagsOnChart(selectedProjectId, newState);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCustomTags = async () => {
    if (!selectedProjectId || !newTagsInput.trim() || actionLoading) return;
    setActionLoading(true);
    try {
      const tagsToAdd = newTagsInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      await analyticsService.analyzeProject(selectedProjectId, { tags: tagsToAdd });
      setNewTagsInput("");
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
      await analyticsService.analyzeProject(newId, { tags: customTags });
      await refreshData(newId, true);
    } catch (err: any) {
      setError("Ошибка импорта");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefreshRankings = async () => {
    if (!selectedProjectId || actionLoading || isSelectedProjectBusy || !data?.tagsMatrix) return;
    setActionLoading(true);
    setData({ ...data, status: "PENDING", tagsMatrix: data.tagsMatrix.map((t: any) => ({ ...t, currentRank: null })) });
    try {
      const currentTags = data.tagsMatrix.map((item: any) => item.tag);
      await analyticsService.analyzeProject(selectedProjectId, { tags: currentTags });
      setIsPolling(true);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleAutoUpdate = async () => {
    if (!selectedProjectId || !data) return;
    const newState = !data.activeProject.isScheduled;
    try {
      await analyticsService.toggleAutoUpdate(selectedProjectId, newState);
      setData({ ...data, activeProject: { ...data.activeProject, isScheduled: newState } });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTag = async (e: React.MouseEvent, tagName: string) => {
    e.stopPropagation();
    if (!selectedProjectId) return;
    const isNowVisible = !visibleTags.includes(tagName);
    setVisibleTags((prev) => (isNowVisible ? [...prev, tagName] : prev.filter((t) => t !== tagName)));
    try {
      await analyticsService.toggleTagOnChart(selectedProjectId, tagName, isNowVisible);
    } catch (err) {
      console.error("Ошибка синхронизации");
    }
  };

  if (loading)
    return (
      <div
        className={`h-screen flex items-center justify-center font-black uppercase text-[10px] tracking-[0.5em] animate-pulse ${isDark ? "bg-[#0a0a0a] text-white" : "bg-behance-grayBg text-behance-black"}`}
      >
        Инициализация BeRanked
      </div>
    );

  return (
    <div
      className={`flex h-screen overflow-hidden transition-colors duration-500 ${isDark ? "bg-[#0a0a0a] text-white" : "bg-behance-grayBg text-behance-black"}`}
    >
      {/* САЙДБАР */}
      <div
        className={`w-80 border-r flex flex-col z-10 transition-colors ${isDark ? "bg-[#111111] border-white/5 shadow-2xl" : "bg-white border-behance-border shadow-sm"}`}
      >
        <div className="p-10 border-b border-behance-border dark:border-white/5 text-center relative">
          <h1 className="text-3xl font-black tracking-tighter uppercase leading-none italic">BeRanked</h1>
          <div className="h-1 w-8 bg-behance-blue mx-auto mt-3 rounded-full shadow-[0_0_15px_rgba(0,87,255,0.4)]"></div>
          <button
            onClick={toggleTheme}
            className={`absolute top-4 right-4 text-xs p-2 rounded-full transition-all hover:scale-110 ${isDark ? "bg-white/5 text-yellow-400" : "bg-gray-100 text-gray-400"}`}
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <div
            onClick={() => {
              setIsAddingNew(true);
              setSelectedProjectId(null);
            }}
            className={`p-6 rounded-[2.2rem] border-2 border-dashed flex items-center justify-center gap-3 cursor-pointer transition-all ${isAddingNew ? "border-behance-blue bg-behance-blue/5 text-behance-blue" : "border-behance-border text-behance-muted hover:border-behance-blue dark:border-white/10"}`}
          >
            <span className="text-lg">＋</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Новый проект</span>
          </div>

          {projects.map((p) => {
            const status = (p as any).analysisStatus;
            const isWorking = status === "PROCESSING";
            const isPending = status === "PENDING";
            return (
              <div
                key={p.id}
                onClick={() => handleProjectSelect(p.id)}
                className={`p-6 rounded-[2.2rem] cursor-pointer transition-all duration-300 relative border ${selectedProjectId === p.id ? "bg-behance-blue border-behance-blue text-white shadow-xl scale-[1.03]" : isDark ? "bg-white/5 border-transparent text-gray-400 hover:bg-white/10" : "bg-white border-behance-border hover:shadow-md"}`}
              >
                {(isWorking || isPending) && (
                  <div
                    className={`absolute top-5 right-7 w-2.5 h-2.5 rounded-full ${isPending ? "bg-amber-400 shadow-[0_0_10px_#fbbf24]" : "bg-white animate-ping"}`}
                  />
                )}
                <div className="text-[11px] font-black truncate uppercase pr-6">{p.title || "Загрузка..."}</div>
                <div
                  className={`text-[8px] mt-2 font-bold uppercase tracking-widest ${selectedProjectId === p.id ? "text-white/50" : "opacity-40"}`}
                >
                  {isPending ? "В очереди" : isWorking ? "Анализ..." : "Активен"}
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-6 border-t border-behance-border dark:border-white/5 space-y-2">
          <button
            onClick={onNavigatePricing}
            className="w-full py-4 rounded-2xl border border-behance-blue/20 bg-behance-blue/5 text-behance-blue text-[10px] font-black uppercase tracking-widest hover:bg-behance-blue/10 transition-all"
          >
            Управление тарифом
          </button>
          <button
            onClick={logout}
            className="w-full py-2 text-[10px] font-black uppercase tracking-widest opacity-20 hover:opacity-100 transition-opacity"
          >
            Выйти из системы
          </button>
        </div>
      </div>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <div className="flex-1 overflow-y-auto flex flex-col relative">
        <div className="flex-1 p-16">
          {!isAddingNew && data && (
            <div className="mb-10 flex gap-4 animate-in fade-in slide-in-from-top-4">
              <div
                className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase border transition-all ${isDark ? "bg-white/5 border-white/10 text-blue-400" : "bg-blue-50 border-blue-100 text-blue-600 shadow-sm"}`}
              >
                Plan: {data.plan}
              </div>
              <div
                className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase border transition-all ${isDark ? "bg-white/5 border-white/10 text-gray-400" : "bg-gray-100 border-gray-200 text-gray-500 shadow-sm"}`}
              >
                Авто-обновление: {nextUpdateInfo}
              </div>
            </div>
          )}

          {isAddingNew ? (
            <div
              className={`max-w-xl mx-auto mt-24 p-16 rounded-[4rem] shadow-2xl border transition-all ${isDark ? "bg-[#111111] border-white/5" : "bg-white border-behance-border"}`}
            >
              <h2 className="text-3xl font-black uppercase text-center mb-10 tracking-tighter italic">Инициализация</h2>
              <form onSubmit={handleImport} className="space-y-6">
                <input
                  className={`w-full rounded-[1.5rem] px-8 py-6 text-xs font-bold outline-none border transition-all ${isDark ? "bg-white/5 border-transparent text-white focus:border-blue-500" : "bg-behance-grayBg border-transparent focus:border-behance-blue shadow-inner"}`}
                  placeholder="Ссылка на проект Behance"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  required
                />
                <textarea
                  className={`w-full rounded-[1.5rem] px-8 py-6 text-xs font-bold outline-none min-h-[150px] border transition-all ${isDark ? "bg-white/5 border-transparent text-white focus:border-blue-500" : "bg-behance-grayBg border-transparent focus:border-behance-blue shadow-inner"}`}
                  placeholder="Свои теги (через запятую)..."
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-behance-blue text-white py-7 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all"
                >
                  {actionLoading ? "Подключение..." : "Запустить проект"}
                </button>
              </form>
            </div>
          ) : (
            selectedProjectId && (
              <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in duration-500">
                <div className="flex justify-between items-start border-b border-behance-border dark:border-white/5 pb-12">
                  <div className="max-w-2xl">
                    <h2 className="text-6xl font-black tracking-tighter uppercase leading-[0.85] mb-8">
                      {selectedProjectInSidebar?.title}
                    </h2>
                    <div className="flex items-center gap-6">
                      <a
                        href={selectedProjectInSidebar?.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-black text-behance-blue uppercase tracking-widest hover:text-black dark:hover:text-white border-b-2 border-behance-blue/20 transition-all"
                      >
                        Источник ↗
                      </a>
                      <button
                        onClick={toggleAutoUpdate}
                        className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl transition-all ${data?.activeProject?.isScheduled ? "bg-green-500/10 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]" : "bg-gray-500/10 text-gray-500"}`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${data?.activeProject?.isScheduled ? "bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" : "bg-gray-500"}`}
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          Робот: {data?.activeProject?.isScheduled ? "Активен" : "Выключен"}
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-5">
                    <button
                      onClick={handleRefreshRankings}
                      disabled={actionLoading || isSelectedProjectBusy}
                      className={`px-12 py-6 rounded-[2rem] text-[10px] font-black uppercase shadow-2xl transition-all hover:scale-105 active:scale-95 ${isSelectedProjectBusy ? "bg-blue-600 text-white animate-pulse" : isDark ? "bg-white text-black" : "bg-black text-white"}`}
                    >
                      {isSelectedProjectBusy ? (data?.status === "PENDING" ? "⏳ В очереди" : "🤖 Анализ...") : "Обновить позиции"}
                    </button>
                  </div>
                </div>

                {/* ГРАФИК */}
                <div
                  ref={chartRef}
                  className={`p-14 rounded-[4rem] border relative overflow-hidden transition-all duration-500 flex items-center justify-center ${isDark ? "bg-[#111111] border-white/5 shadow-inner" : "bg-white border-behance-border shadow-2xl shadow-blue-900/5"}`}
                >
                  <div className="h-[450px] w-full flex items-center justify-center">
                    {isChartEmpty ? (
                      <div className="text-center animate-in fade-in zoom-in-95 duration-700">
                        <div className="text-5xl mb-6 opacity-20">📊</div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] opacity-30 leading-loose">
                          Выберите теги в матрице ниже <br /> для визуализации истории позиций
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

                {/* ТАБЛИЦА МАТРИЦЫ (Компактная) */}
                <div
                  className={`rounded-[3.5rem] border overflow-hidden transition-all ${isDark ? "bg-[#111111] border-white/5 shadow-inner" : "bg-white border-behance-border shadow-lg"}`}
                >
                  <div className="px-10 py-6 border-b border-behance-border dark:border-white/5 flex justify-between items-center bg-gray-50/30 dark:bg-white/5">
                    <div className="flex items-center gap-6">
                      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 italic">Матрица тегов</h3>
                      <button
                        onClick={toggleAllTags}
                        className="text-[9px] font-black uppercase text-blue-500 hover:text-blue-600 border-b border-blue-500/20 pb-0.5 transition-all"
                      >
                        {visibleTags.length === data?.tagsMatrix?.length ? "Скрыть всё" : "Отобразить всё"}
                      </button>
                    </div>
                    <div className="flex gap-4">
                      <input
                        className={`rounded-xl px-4 py-2 text-[10px] font-bold outline-none w-48 border transition-all ${isDark ? "bg-white/5 border-transparent text-white focus:bg-white/10" : "bg-white border-gray-100 shadow-sm focus:border-blue-200"}`}
                        placeholder="Добавить тег..."
                        value={newTagsInput}
                        onChange={(e) => setNewTagsInput(e.target.value)}
                      />
                      <button
                        onClick={handleAddCustomTags}
                        disabled={actionLoading || isSelectedProjectBusy}
                        className="bg-behance-blue text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase shadow-lg shadow-blue-500/20 transition-all"
                      >
                        Добавить
                      </button>
                    </div>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-behance-border dark:divide-white/5">
                      {(data?.tagsMatrix || []).map((item: any, idx: number) => {
                        const isVisible = visibleTags.includes(item.tag);
                        return (
                          <tr
                            key={idx}
                            onMouseEnter={() => setFocusedTag(item.tag)}
                            onMouseLeave={() => setFocusedTag(null)}
                            className={`transition-colors duration-200 ${isDark ? "hover:bg-white/5" : "hover:bg-behance-grayBg"}`}
                          >
                            <td className="px-10 py-4 flex items-center gap-4">
                              <div className="w-2.5 h-2.5 rounded-full shadow-inner" style={{ backgroundColor: tagColors[item.tag] }}></div>
                              <span
                                className={`text-[13px] font-black uppercase tracking-tight transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-15"}`}
                              >
                                #{item.tag}
                              </span>
                            </td>
                            <td className="px-10 py-4 text-right">
                              <div className="flex items-center justify-end gap-8">
                                {item.currentRank === null ? (
                                  <span className="text-blue-500 animate-pulse text-[9px] font-black uppercase italic tracking-widest">
                                    🤖 Проверка...
                                  </span>
                                ) : (
                                  <span
                                    className={`text-[11px] font-black uppercase tracking-tight ${item.currentRank > 0 ? (item.currentRank <= 10 ? "text-green-500" : "text-blue-500") : isDark ? "text-white/10" : "text-gray-300"}`}
                                  >
                                    {item.currentRank > 0 ? `Место #${item.currentRank}` : "Вне Топ-100"}
                                  </span>
                                )}
                                <button
                                  onClick={(e) => toggleTag(e, item.tag)}
                                  className={`w-10 h-5 rounded-full relative transition-all duration-500 ${isVisible ? "bg-behance-blue shadow-lg shadow-blue-500/40" : isDark ? "bg-white/5" : "bg-gray-200"}`}
                                >
                                  <div
                                    className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${isVisible ? "left-6" : "left-1"}`}
                                  />
                                </button>
                              </div>
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

        {/* ГЛОБАЛЬНЫЙ ФУТЕР */}
        <footer
          className={`mt-auto py-20 px-16 border-t transition-colors flex flex-col xl:flex-row justify-between items-center gap-16 ${isDark ? "bg-[#0d0d0d] border-white/5" : "bg-white border-behance-border shadow-[0_-10px_40px_rgba(0,0,0,0.02)]"}`}
        >
          <div className="flex flex-col items-center xl:items-start gap-4 flex-1">
            <span className="text-[18px] font-black uppercase tracking-[0.4em] text-behance-blue">BeRanked</span>
            <div className="flex flex-col gap-1 opacity-40 items-center xl:items-start">
              <span className="text-[11px] font-bold uppercase tracking-widest whitespace-nowrap">© 2026 Product by DomCraft Digital</span>
              <span className="text-[10px] font-medium uppercase tracking-tight">Харин Владислав • ИНН 563811937786</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-5 flex-1">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Secure Payments</span>
            <img
              src="/payments.png"
              alt="Visa, Mastercard, Mir"
              className={`h-12 w-auto object-contain transition-all duration-500 ${isDark ? "brightness-200 grayscale opacity-60 hover:opacity-100 hover:grayscale-0" : "opacity-90 hover:opacity-100"}`}
            />
          </div>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 flex-1">
            {[
              { label: "Оферта", link: "/terms.html" },
              { label: "Приватность", link: "/privacy.html" },
              { label: "Возврат", link: "/refund.html" },
            ].map((doc, idx) => (
              <a
                key={idx}
                href={doc.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-black uppercase tracking-[0.2em] text-behance-muted hover:text-behance-blue transition-all border-b-2 border-transparent hover:border-behance-blue/20 pb-1"
              >
                {doc.label}
              </a>
            ))}
          </div>
          <div className="flex flex-col items-center xl:items-end gap-3 flex-1">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 text-center xl:text-right">Direct Support</span>
            <a
              href="mailto:dom.craft.digital@gmail.com"
              className="text-[13px] font-black uppercase tracking-widest text-behance-blue hover:text-blue-400 transition-colors border-b-2 border-behance-blue/10 hover:border-behance-blue"
            >
              dom.craft.digital@gmail.com
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};
