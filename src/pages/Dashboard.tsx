import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { analyticsService, type DashboardData, type BehanceProject, type HistoryPoint } from "../services/analyticsService";

const COLORS = ["#0057ff", "#00c853", "#ff0057", "#ffab00", "#7e57c2", "#26c6da", "#ec407a"];

export const Dashboard: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  // --- ДАННЫЕ ---
  const [projects, setProjects] = useState<BehanceProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
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

  // ВЫЧИСЛЕНИЯ
  const selectedProjectInSidebar = useMemo(() => projects.find((p) => p.id === selectedProjectId) || null, [projects, selectedProjectId]);

  const tagColors = useMemo(() => {
    const map: Record<string, string> = {};
    if (data?.tagsMatrix) {
      data.tagsMatrix.forEach((item, idx) => {
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
  const isChartEmpty = (visibleTags.length === 0 && !focusedTag) || chartData.length === 0;

  // --- ЛОГИКА ОБНОВЛЕНИЯ ---

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

  // --- ОБРАБОТЧИКИ ---

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setActionLoading(true);
    setError("");

    try {
      console.log("Начало импорта..."); // если есть логгер, или просто console.log
      const res = await analyticsService.importCase(urlInput, userId);

      // ДИАГНОСТИКА: Посмотри в консоль браузера, что именно пришло
      console.log("Ответ сервера:", res);

      // Проверяем ID. Пробуем разные варианты в зависимости от настроек твоего Axios
      const newProject = res.data || res;
      const newId = newProject.id;

      if (!newId) {
        console.error("ID не найден в ответе:", newProject);
        throw new Error("Сервер не вернул ID проекта");
      }

      // 1. СРАЗУ переключаем UI, не дожидаясь анализа тегов
      setSelectedProjectId(newId);
      setIsAddingNew(false);
      setUrlInput("");
      setTagsInput("");

      // 2. Если есть свои теги, запускаем их анализ "фоном"
      const customTags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      if (customTags.length > 0) {
        // Мы НЕ пишем await здесь, чтобы ошибка в тегах не ломала переход к проекту
        analyticsService.analyzeProject(newId, customTags).catch((err) => {
          console.error("Ошибка при запуске анализа тегов:", err);
        });
      }

      // 3. Обновляем данные (проект будет в статусе PENDING или PROCESSING)
      await refreshData(newId, true);
    } catch (err: any) {
      // Это поможет тебе увидеть в консоли, почему сработал блок catch
      console.error("Детальная ошибка фронтенда:", err);
      setError(err.response?.data?.message || "Ошибка при получении данных от сервера");
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

  const handleAddCustomTags = async () => {
    if (!selectedProjectId || !newTagsInput.trim()) return;
    setActionLoading(true);
    try {
      const tagsToAdd = newTagsInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      await analyticsService.analyzeProject(selectedProjectId, tagsToAdd);
      setNewTagsInput("");
      setIsPolling(true);
    } finally {
      setActionLoading(false);
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
      console.error("Ошибка синхронизации тега");
    }
  };

  const scrollToChart = () => chartRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8f9fb] font-black uppercase text-[10px] tracking-[0.4em] animate-pulse">
        Инициализация Матрицы
      </div>
    );

  return (
    <div className="flex h-screen bg-[#f8f9fb] font-sans text-[#1d1d1f] overflow-hidden">
      {/* САЙДБАР */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.02)] z-10">
        <div className="p-10 border-b border-gray-50 text-center">
          <h1 className="text-3xl font-black tracking-tighter uppercase leading-none italic">Matrix</h1>
          <div className="h-1 w-8 bg-blue-600 mx-auto mt-3 rounded-full"></div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <div
            onClick={() => {
              setIsAddingNew(true);
              setSelectedProjectId(null);
            }}
            className={`p-6 rounded-[2rem] border-2 border-dashed flex items-center justify-center gap-3 cursor-pointer transition-all ${isAddingNew ? "border-blue-600 bg-blue-50 text-blue-600 shadow-inner" : "border-gray-100 text-gray-300 hover:border-gray-300 hover:bg-gray-50"}`}
          >
            <span className="text-lg">＋</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Новый проект</span>
          </div>

          {projects.map((p) => {
            const status = (p as any).analysisStatus;
            const isWorking = status !== "IDLE";
            const isWait = status === "PENDING";
            return (
              <div
                key={p.id}
                onClick={() => handleProjectSelect(p.id)}
                className={`p-6 rounded-[2.2rem] cursor-pointer transition-all duration-300 relative border ${
                  selectedProjectId === p.id
                    ? "bg-black border-black text-white shadow-2xl scale-[1.03]"
                    : "bg-white border border-gray-50 text-gray-500 hover:shadow-md hover:scale-[1.01]"
                }`}
              >
                {isWorking && (
                  <div
                    className={`absolute top-5 right-7 w-2.5 h-2.5 rounded-full shadow-sm ${isWait ? "bg-amber-400" : "bg-blue-500 animate-ping"}`}
                  />
                )}
                <div className="text-[11px] font-black truncate uppercase tracking-tight pr-6">{p.title || "Загрузка..."}</div>
                <div
                  className={`text-[8px] mt-2 font-bold uppercase tracking-widest ${isWorking ? (isWait ? "text-amber-500" : "text-blue-400") : "opacity-30"}`}
                >
                  {isWorking ? (isWait ? "В очереди" : "Робот работает") : "В архиве"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <div className="flex-1 overflow-y-auto relative bg-[#f8f9fb]">
        {/* ВЕРХНИЙ СТАТУС-БАР */}
        {isCurrentProjectBusy && (
          <div
            className={`fixed top-8 right-12 z-50 px-7 py-3 rounded-full shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-10 border transition-all ${
              data?.status === "PENDING" ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-black text-white border-black"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${data?.status === "PENDING" ? "bg-amber-500" : "bg-blue-500 animate-ping"}`}></div>
            <span className="text-[10px] font-black uppercase tracking-[0.15em]">
              {data?.status === "PENDING" ? "Ожидание в очереди" : "Робот активен"}
            </span>
          </div>
        )}

        {isAddingNew ? (
          <div className="max-w-xl mx-auto mt-24 p-16 bg-white rounded-[3.5rem] shadow-2xl border border-gray-50 animate-in zoom-in-95 duration-500">
            <h2 className="text-3xl font-black uppercase text-center mb-10 tracking-tighter italic">Инициализация</h2>
            <form onSubmit={handleImport} className="space-y-5">
              <input
                className="w-full bg-gray-50 border-none rounded-2xl px-8 py-5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                placeholder="Ссылка на проект Behance"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                required
              />
              <textarea
                className="w-full bg-gray-50 border-none rounded-2xl px-8 py-5 text-xs font-bold outline-none resize-none min-h-[120px]"
                placeholder="Свои теги (через запятую, необязательно)..."
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
              {error && <p className="text-red-500 text-[10px] font-bold uppercase text-center">{error}</p>}
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-blue-600 text-white py-6 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {actionLoading ? "Подключение..." : "Запустить проект"}
              </button>
            </form>
          </div>
        ) : (
          selectedProjectId && (
            <div className="p-16 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
              {detailsLoading && (
                <div className="absolute inset-0 bg-[#f8f9fb]/80 backdrop-blur-sm z-30 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              <div className="flex justify-between items-end border-b border-gray-100 pb-12">
                <div>
                  <h2 className="text-4xl font-black tracking-tighter uppercase leading-[0.9] mb-4">{selectedProjectInSidebar?.title}</h2>
                  <a
                    href={selectedProjectInSidebar?.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-black transition-colors"
                  >
                    Открыть источник ↗
                  </a>
                </div>
                <button
                  onClick={handleRefreshRankings}
                  disabled={actionLoading || isCurrentProjectBusy}
                  className="bg-black text-white px-10 py-5 rounded-2xl text-[9px] font-black uppercase shadow-xl disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
                >
                  {actionLoading ? "В очереди..." : isCurrentProjectBusy ? "Робот активен" : "Обновить позиции"}
                </button>
              </div>

              {/* ГРАФИК */}
              <div ref={chartRef} className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="h-[400px] w-full flex items-center justify-center">
                  {isChartEmpty ? (
                    <div className="text-center opacity-30">
                      <div className="text-4xl mb-3">📊</div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-center">Выберите теги ниже для визуализации</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                        <XAxis dataKey="date" tick={{ fontSize: 9, fontWeight: "900" }} dy={15} axisLine={false} tickLine={false} />
                        <YAxis reversed tick={{ fontSize: 9, fontWeight: "900" }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "20px",
                            border: "none",
                            boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
                            fontSize: "12px",
                            fontWeight: "900",
                            textTransform: "uppercase",
                          }}
                        />
                        {Object.keys(history).map((tag) => {
                          const isVis = visibleTags.includes(tag);
                          const isFoc = focusedTag === tag;
                          if (!isVis && !isFoc) return null;
                          const opacity = focusedTag ? (isFoc ? 1 : 0.08) : 1;
                          return (
                            <Line
                              key={tag}
                              type="monotone"
                              dataKey={tag}
                              stroke={tagColors[tag] || "#000"}
                              strokeWidth={isFoc ? 6 : 3}
                              strokeOpacity={opacity}
                              dot={isFoc ? { r: 6, strokeWidth: 4 } : { r: 4 }}
                              animationDuration={400}
                            />
                          );
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* МАТРИЦА ТЕГОВ */}
              <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-12 py-8 border-b border-gray-50 bg-gray-50/20 flex justify-between items-center text-black">
                  <h3 className="text-[11px] font-black uppercase tracking-widest">Матрица Интеллекта</h3>
                  <div className="flex gap-2">
                    <input
                      className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-[10px] font-bold outline-none w-48 shadow-inner"
                      placeholder="Добавить тег..."
                      value={newTagsInput}
                      onChange={(e) => setNewTagsInput(e.target.value)}
                    />
                    <button
                      onClick={handleAddCustomTags}
                      disabled={actionLoading || isCurrentProjectBusy}
                      className="bg-blue-600 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-blue-700 transition-all shadow-md"
                    >
                      Добавить
                    </button>
                  </div>
                </div>
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-gray-50">
                    {(data?.tagsMatrix || []).map((item, idx) => {
                      const isFoc = focusedTag === item.tag;
                      const isVis = visibleTags.includes(item.tag);
                      return (
                        <tr
                          key={idx}
                          onMouseDown={() => setFocusedTag(isFoc ? null : item.tag)}
                          className={`cursor-pointer transition-all duration-300 ${isFoc ? "bg-blue-50/60" : "hover:bg-gray-50/40"}`}
                        >
                          <td className="px-12 py-8">
                            <div className="flex items-center gap-4">
                              <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: tagColors[item.tag] }}></div>
                              <div className="flex flex-col">
                                <span
                                  className={`text-base font-black uppercase tracking-tight transition-colors ${isVis || isFoc ? "text-black" : "text-gray-300"}`}
                                >
                                  #{item.tag}
                                </span>
                                {isFoc && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      scrollToChart();
                                    }}
                                    className="text-[8px] font-black text-blue-600 uppercase mt-1 text-left"
                                  >
                                    ↑ На график
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-12 py-8 text-right flex items-center justify-end gap-6">
                            {item.currentRank !== null ? (
                              <span
                                className={`text-[11px] font-black uppercase ${item.currentRank > 0 ? (item.currentRank <= 10 ? "text-green-500" : "text-blue-600") : "text-gray-300"}`}
                              >
                                {item.currentRank > 0 ? `Место #${item.currentRank}` : "Вне Топа"}
                              </span>
                            ) : (
                              <span className="text-blue-500 animate-pulse text-[9px] font-black uppercase italic">🤖 Проверка...</span>
                            )}

                            <button
                              onClick={(e) => toggleTag(e, item.tag)}
                              className={`w-12 h-6 rounded-full transition-all relative ${isVis ? "bg-blue-600 shadow-md" : "bg-gray-100"}`}
                            >
                              <div
                                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${isVis ? "left-7" : "left-1"}`}
                              ></div>
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
    </div>
  );
};
