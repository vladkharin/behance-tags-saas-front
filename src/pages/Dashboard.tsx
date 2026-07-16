import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { analyticsService, type BehanceProject, type HistoryPoint } from "../services/analyticsService";
import { formatDistanceToNow, addHours } from "date-fns";
import { ru } from "date-fns/locale";
import { useTheme } from "../context/ThemeContextInstance"; // Подключаем глобальную тему

const COLORS = ["#0057ff", "#00c853", "#ff0057", "#ffab00", "#7e57c2", "#26c6da", "#ec407a"];

const PLAN_HOURS = {
  FREE: 168,
  DAILY_FRESH: 72,
  PRO_STREAM: 24,
};

export const Dashboard: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark"; // Оставляем переменную только для графиков Recharts

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
  const [error, setError] = useState("");

  const userId = localStorage.getItem("userId") || "";

  // --- ВЫЧИСЛЕНИЯ ---
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

  const isCurrentProjectBusy = useMemo(() => data?.status && data.status !== "IDLE", [data?.status]);

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
          if (isInitialLoad || visibleTags.length === 0) {
            const activeFromDb = detailsRes.tagsMatrix.filter((t: any) => t.onChart).map((t: any) => t.tag);
            setVisibleTags(activeFromDb);
          }
        }
        setData(detailsRes);
        setHistory(historyRes || {});
        setIsPolling(detailsRes.status !== "IDLE");
      } catch (e) {
        console.error("Ошибка обновления данных");
      }
    },
    [selectedProjectId, userId, visibleTags.length],
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
      const safeList = list || [];
      setProjects(safeList);
      if (safeList.length === 0) {
        setIsAddingNew(true);
      } else {
        setSelectedProjectId(safeList[0].id);
        await refreshData(safeList[0].id, true);
      }
      setLoading(false);
    };
    init();
  }, [userId]);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setActionLoading(true);
    setError("");
    try {
      const res = await analyticsService.importCase(urlInput, userId);
      const newProject = res.data || res;
      const newId = newProject.id;
      setSelectedProjectId(newId);
      setIsAddingNew(false);
      setUrlInput("");
      setTagsInput("");
      const customTags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      if (customTags.length > 0) {
        analyticsService.analyzeProject(newId, customTags).catch(() => {});
      }
      await refreshData(newId, true);
    } catch (err: any) {
      setError("Ошибка при импорте проекта");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefreshRankings = async () => {
    if (!selectedProjectId) return;
    setActionLoading(true);
    try {
      await analyticsService.analyzeProject(selectedProjectId);
      setIsPolling(true);
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
      console.error("Ошибка смены режима");
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
      <div className="h-screen flex items-center justify-center font-black uppercase text-[10px] tracking-[0.4em] animate-pulse bg-behance-grayBg text-behance-black dark:bg-behance-darkBg dark:text-white">
        Инициализация BeRanked
      </div>
    );

  return (
    <div className="flex h-screen font-sans overflow-hidden bg-behance-grayBg text-behance-black dark:bg-behance-darkBg dark:text-white transition-colors duration-500">
      {/* САЙДБАР */}
      <div className="w-80 border-r flex flex-col z-10 transition-colors bg-white border-behance-border shadow-sm dark:bg-behance-darkCard dark:border-white/5 dark:shadow-2xl">
        <div className="p-10 border-b border-behance-border dark:border-white/5 text-center relative">
          <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">BeRanked</h1>
          <div className="h-1 w-8 bg-behance-blue mx-auto mt-3 rounded-full"></div>

          <button
            onClick={toggleTheme}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all bg-behance-grayBg text-behance-muted dark:bg-white/5 dark:text-yellow-400"
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
            className={`p-6 rounded-[2rem] border-2 border-dashed flex items-center justify-center gap-3 cursor-pointer transition-all ${isAddingNew ? "border-behance-blue bg-behance-blue/5 text-behance-blue" : "border-behance-border text-behance-muted hover:border-behance-blue/50 dark:border-white/10"}`}
          >
            <span className="text-lg">＋</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Новый проект</span>
          </div>

          {projects.map((p) => {
            const status = (p as any).analysisStatus;
            const isWorking = status !== "IDLE";
            const isWait = status === "PENDING";
            const isActive = selectedProjectId === p.id;
            return (
              <div
                key={p.id}
                onClick={() => handleProjectSelect(p.id)}
                className={`p-6 rounded-[2.2rem] cursor-pointer transition-all duration-300 relative border ${
                  isActive
                    ? "bg-behance-blue border-behance-blue text-white shadow-xl scale-[1.03]"
                    : "bg-white border-behance-border text-behance-muted hover:shadow-md dark:bg-white/5 dark:border-transparent dark:text-gray-400 dark:hover:bg-white/10"
                }`}
              >
                {isWorking && (
                  <div
                    className={`absolute top-5 right-7 w-2.5 h-2.5 rounded-full shadow-sm ${isWait ? "bg-amber-400" : "bg-white animate-ping"}`}
                  />
                )}
                <div className="text-[11px] font-black truncate uppercase tracking-tight pr-6">{p.title || "Загрузка..."}</div>
                <div className={`text-[8px] mt-2 font-bold uppercase tracking-widest ${isActive ? "text-white/60" : "opacity-30"}`}>
                  {isWorking ? (isWait ? "В очереди" : "Парсинг...") : "Активен"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <div className="flex-1 overflow-y-auto relative bg-behance-grayBg dark:bg-behance-darkBg">
        {!isAddingNew && data && (
          <div className="px-16 pt-10 flex gap-4">
            <div className="px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border bg-white border-behance-border text-behance-blue dark:bg-white/5 dark:border-white/10">
              Plan: {data.plan}
            </div>
            <div className="px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border bg-white border-behance-border text-behance-muted dark:bg-white/5 dark:border-white/10">
              Авто-обновление: {nextUpdateInfo}
            </div>
          </div>
        )}

        {isAddingNew ? (
          <div className="max-w-xl mx-auto mt-24 p-16 rounded-[3.5rem] shadow-2xl bg-white border border-behance-border dark:bg-behance-darkCard dark:border-white/5">
            <h2 className="text-3xl font-black uppercase text-center mb-10 tracking-tighter italic">Инициализация</h2>
            <form onSubmit={handleImport} className="space-y-5">
              <input
                className="w-full rounded-2xl px-8 py-5 text-xs font-bold outline-none transition-all bg-behance-grayBg dark:bg-white/5 dark:text-white border border-transparent focus:border-behance-blue"
                placeholder="Ссылка на проект Behance"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                required
              />
              <textarea
                className="w-full rounded-2xl px-8 py-5 text-xs font-bold outline-none resize-none min-h-[120px] transition-all bg-behance-grayBg dark:bg-white/5 dark:text-white border border-transparent focus:border-behance-blue"
                placeholder="Свои теги (через запятую)..."
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
              {error && <p className="text-red-500 text-[10px] font-bold uppercase text-center">{error}</p>}
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-behance-blue text-white py-6 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-behance-darkBlue transition-all disabled:opacity-50"
              >
                {actionLoading ? "Подключение..." : "Запустить проект"}
              </button>
            </form>
          </div>
        ) : (
          selectedProjectId && (
            <div className="p-16 max-w-6xl mx-auto space-y-10">
              <div className="flex justify-between items-start border-b border-behance-border dark:border-white/5 pb-12">
                <div>
                  <h2 className="text-5xl font-black tracking-tighter uppercase leading-none mb-6">{selectedProjectInSidebar?.title}</h2>
                  <div className="flex items-center gap-6">
                    <a
                      href={selectedProjectInSidebar?.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-black text-behance-blue uppercase tracking-widest"
                    >
                      Источник ↗
                    </a>
                    <button
                      onClick={toggleAutoUpdate}
                      className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${data?.activeProject?.isScheduled ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-500"}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${data?.activeProject?.isScheduled ? "bg-green-500 animate-pulse" : "bg-gray-500"}`}
                      ></div>
                      <span className="text-[9px] font-black uppercase tracking-widest">
                        Робот: {data?.activeProject?.isScheduled ? "ВКЛ" : "ВЫКЛ"}
                      </span>
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleRefreshRankings}
                  disabled={actionLoading || isCurrentProjectBusy}
                  className="px-10 py-5 rounded-2xl text-[9px] font-black uppercase shadow-xl transition-all hover:scale-105 bg-behance-black text-white dark:bg-white dark:text-black"
                >
                  Обновить сейчас
                </button>
              </div>

              {/* ГРАФИК */}
              <div className="p-12 rounded-[3.5rem] border bg-white border-behance-border shadow-sm dark:bg-behance-darkCard dark:border-white/5 dark:shadow-inner">
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#222" : "#f0f0f0"} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 9, fontWeight: "900", fill: isDark ? "#444" : "#ccc" }}
                        dy={15}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        reversed
                        tick={{ fontSize: 9, fontWeight: "900", fill: isDark ? "#444" : "#ccc" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "20px",
                          backgroundColor: isDark ? "#1a1a1a" : "#fff",
                          border: "none",
                          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
                          fontSize: "12px",
                          fontWeight: "900",
                          color: isDark ? "#fff" : "#000",
                        }}
                      />
                      {Object.keys(history).map(
                        (tag) =>
                          visibleTags.includes(tag) && (
                            <Line
                              key={tag}
                              type="monotone"
                              dataKey={tag}
                              stroke={tagColors[tag]}
                              strokeWidth={focusedTag === tag ? 6 : 3}
                              dot={{ r: 4 }}
                              animationDuration={400}
                            />
                          ),
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ТАБЛИЦА МАТРИЦЫ */}
              <div className="rounded-[3.5rem] border overflow-hidden bg-white border-behance-border dark:bg-behance-darkCard dark:border-white/5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-behance-grayBg dark:bg-white/5">
                      <th className="px-12 py-6 text-[10px] font-black uppercase tracking-widest opacity-40">Тег</th>
                      <th className="px-12 py-6 text-right text-[10px] font-black uppercase tracking-widest opacity-40">Позиция</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-behance-border dark:divide-white/5">
                    {(data?.tagsMatrix || []).map((item: any, idx: number) => (
                      <tr
                        key={idx}
                        onMouseEnter={() => setFocusedTag(item.tag)}
                        onMouseLeave={() => setFocusedTag(null)}
                        className="transition-colors hover:bg-behance-grayBg dark:hover:bg-white/5"
                      >
                        <td className="px-12 py-8">
                          <div className="flex items-center gap-4">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tagColors[item.tag] }}></div>
                            <span
                              className={`text-sm font-black uppercase tracking-tight ${visibleTags.includes(item.tag) ? "opacity-100" : "opacity-20"}`}
                            >
                              #{item.tag}
                            </span>
                          </div>
                        </td>
                        <td className="px-12 py-8 text-right flex items-center justify-end gap-6">
                          <span
                            className={`text-[11px] font-black uppercase ${item.currentRank > 0 ? "text-behance-blue" : "text-gray-500"}`}
                          >
                            {item.currentRank > 0 ? `Place #${item.currentRank}` : "Out of Top"}
                          </span>
                          <button
                            onClick={(e) => toggleTag(e, item.tag)}
                            className={`w-10 h-5 rounded-full transition-all relative ${visibleTags.includes(item.tag) ? "bg-behance-blue" : "bg-gray-200 dark:bg-white/10"}`}
                          >
                            <div
                              className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${visibleTags.includes(item.tag) ? "left-6" : "left-1"}`}
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
