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

        // Проверка на актуальность ID (защита от гонки запросов)
        if (targetId !== selectedProjectId && !isInitialLoad) return;

        setProjects(listRes || []);

        if (detailsRes.tagsMatrix) {
          detailsRes.tagsMatrix.sort((a: any, b: any) => a.tag.localeCompare(b.tag));

          // Обновляем видимые теги только при первом заходе или если их список в стейте пустой
          if (isInitialLoad || visibleTags.length === 0) {
            const activeFromDb = detailsRes.tagsMatrix.filter((t: any) => t.onChart).map((t: any) => t.tag);
            setVisibleTags(activeFromDb);
          }
        }

        setData(detailsRes);
        setHistory(historyRes || {});

        // Включаем или выключаем поллинг
        if (detailsRes.status !== "IDLE") {
          setIsPolling(true);
        } else {
          setIsPolling(false);
        }
      } catch (e) {
        console.error("Refresh error");
      }
    },
    [selectedProjectId, userId, visibleTags.length],
  );

  // Таймер поллинга
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPolling && selectedProjectId) {
      interval = setInterval(() => refreshData(selectedProjectId), 3000);
    }
    return () => clearInterval(interval);
  }, [isPolling, selectedProjectId, refreshData]);

  // Смена проекта
  const handleProjectSelect = async (id: string) => {
    if (id === selectedProjectId) return;
    setSelectedProjectId(id);
    setDetailsLoading(true);
    setIsAddingNew(false);
    setFocusedTag(null);
    setVisibleTags([]); // Сбрасываем теги графика, они подгрузятся из базы нового проекта
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
      if (safeList.length === 0) setIsAddingNew(true);
      else {
        setSelectedProjectId(safeList[0].id);
        if (safeList.some((p: any) => p.analysisStatus !== "IDLE")) setIsPolling(true);
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
      const customTags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      const res = await analyticsService.importCase(urlInput, userId);
      const newId = res.data.id || res.data.projectId;

      // Сразу добавляем кастомные теги в анализ
      if (customTags.length > 0) {
        await analyticsService.analyzeProject(newId, customTags);
      }

      await fetchProjectsList(); // Обновим список чтобы увидеть "Pending"
      setSelectedProjectId(newId);
      setIsPolling(true);
      setUrlInput("");
      setTagsInput("");
    } catch (err) {
      setError("Import failed");
    } finally {
      setActionLoading(false);
    }
  };

  const fetchProjectsList = async () => {
    const list = await analyticsService.getUserProjects(userId);
    setProjects(list || []);
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
      console.error("Sync error");
    }
  };

  const scrollToChart = () => chartRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8f9fb] font-black uppercase text-[10px] tracking-[0.4em] animate-pulse">
        Initializing Matrix
      </div>
    );

  return (
    <div className="flex h-screen bg-[#f8f9fb] font-sans text-[#1d1d1f] overflow-hidden">
      {/* SIDEBAR */}
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
            className={`p-6 rounded-[2rem] border-2 border-dashed flex items-center justify-center gap-3 cursor-pointer ${isAddingNew ? "border-blue-600 bg-blue-50 text-blue-600 shadow-inner" : "border-gray-100 text-gray-300 hover:border-gray-300"}`}
          >
            <span className="text-lg">＋</span>
            <span className="text-[10px] font-black uppercase tracking-widest">New Track</span>
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
                    : "bg-white border border-gray-50 text-gray-500 hover:shadow-md"
                }`}
              >
                {isWorking && (
                  <div
                    className={`absolute top-5 right-7 w-2.5 h-2.5 rounded-full shadow-sm ${isWait ? "bg-amber-400" : "bg-blue-500 animate-ping"}`}
                  />
                )}
                <div className="text-[11px] font-black truncate uppercase tracking-tight pr-6">{p.title || "Untitled Project"}</div>
                <div
                  className={`text-[8px] mt-2 font-bold uppercase tracking-widest ${isWorking ? (isWait ? "text-amber-500" : "text-blue-400") : "opacity-30"}`}
                >
                  {isWorking ? (isWait ? "In Queue" : "Robot Active") : "Inventory Case"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN VIEW */}
      <div className="flex-1 overflow-y-auto relative bg-[#f8f9fb]">
        {/* TOP STATUS BAR */}
        {isCurrentProjectBusy && (
          <div
            className={`absolute top-8 right-12 z-50 px-7 py-3 rounded-full shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-10 border transition-all ${
              data?.status === "PENDING" ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-black text-white border-black"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${data?.status === "PENDING" ? "bg-amber-500" : "bg-blue-500 animate-ping"}`}></div>
            <span className="text-[10px] font-black uppercase tracking-[0.15em]">
              {data?.status === "PENDING" ? "Waiting in Queue" : "Robot Active"}
            </span>
          </div>
        )}

        {isAddingNew ? (
          <div className="max-w-xl mx-auto mt-24 p-16 bg-white rounded-[3.5rem] shadow-2xl border border-gray-50 animate-in zoom-in-95 duration-500">
            <h2 className="text-3xl font-black uppercase text-center mb-10 tracking-tighter italic">Initialize</h2>
            <form onSubmit={handleImport} className="space-y-5">
              <input
                className="w-full bg-gray-50 border-none rounded-2xl px-8 py-5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                placeholder="Gallery URL"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                required
              />
              <textarea
                className="w-full bg-gray-50 border-none rounded-2xl px-8 py-5 text-xs font-bold outline-none resize-none min-h-[120px]"
                placeholder="Custom tags (optional)..."
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-blue-600 text-white py-6 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl"
              >
                {actionLoading ? "Connecting..." : "Launch Project"}
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
                    Source Link ↗
                  </a>
                </div>
                <button
                  onClick={handleRefreshRankings}
                  disabled={actionLoading || isCurrentProjectBusy}
                  className="bg-black text-white px-10 py-5 rounded-2xl text-[9px] font-black uppercase shadow-xl disabled:opacity-30 transition-all"
                >
                  {actionLoading ? "Queuing..." : isCurrentProjectBusy ? "Robot Active" : "Refresh Rankings"}
                </button>
              </div>

              {/* CHART */}
              <div ref={chartRef} className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="h-[400px] w-full flex items-center justify-center">
                  {isChartEmpty ? (
                    <div className="text-center opacity-30">
                      <div className="text-4xl mb-3">📊</div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-center">Select tags below to visualize</p>
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
                        {Object.keys(history).map((tag, idx) => {
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

              {/* MATRIX */}
              <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-12 py-8 border-b border-gray-50 bg-gray-50/20 flex justify-between items-center text-black">
                  <h3 className="text-[11px] font-black uppercase tracking-widest">Intelligence Matrix</h3>
                  <div className="flex gap-2">
                    <input
                      className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-[10px] font-bold outline-none w-48 shadow-inner"
                      placeholder="Add tag..."
                      value={newTagsInput}
                      onChange={(e) => setNewTagsInput(e.target.value)}
                    />
                    <button
                      onClick={handleAddCustomTags}
                      disabled={actionLoading || isCurrentProjectBusy}
                      className="bg-blue-600 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-blue-700 transition-all shadow-md"
                    >
                      Add
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
                                    ↑ View on Chart
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
                                {item.currentRank > 0 ? `Rank #${item.currentRank}` : "Out of Top"}
                              </span>
                            ) : (
                              <span className="text-blue-500 animate-pulse text-[9px] font-black uppercase italic font-black">
                                🤖 Checking...
                              </span>
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
