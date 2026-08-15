import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContextInstance";
import { useToast } from "../../context/ToastContext";
import type { TagMatrixItem } from "../../types/analytics.types";

interface TagsMatrixProps {
  tags: TagMatrixItem[];
  visibleTags: string[];
  suggestedTags?: string[];
  tagColors: Record<string, string>;
  activeFilter: "all" | "top10" | "potential" | "lost";
  hasCustomTags: boolean;
  hasTrends: boolean;
  isDemoMode: boolean;
  isBusy: boolean;
  getTrend: (tag: string, rank: number | null) => number;
  onFilterChange: (filter: "all" | "top10" | "potential" | "lost") => void;
  onToggleTag: (e: React.MouseEvent, tagName: string) => void;
  onToggleAllTags: () => void;
  onAddCustomTags: (tags: string) => Promise<void>;
  onAddSuggestedTag?: (tagName: string) => Promise<void>;
  onRemoveTag?: (tagName: string) => Promise<void>;
  onFocusTag: (tag: string | null) => void;
}

const QUICK_TAG_SUGGESTIONS = [
  "ui/ux",
  "mobile app",
  "branding",
  "3d render",
  "figma",
  "web design",
  "illustration",
  "motion design",
  "typography",
  "logo",
];

type SortField = "name" | "rank" | "trend";
type SortDirection = "asc" | "desc";

export const TagsMatrix: React.FC<TagsMatrixProps> = ({
  tags,
  visibleTags,
  suggestedTags,
  tagColors,
  activeFilter,
  hasCustomTags,
  hasTrends,
  isBusy,
  getTrend,
  onFilterChange,
  onToggleTag,
  onToggleAllTags,
  onAddCustomTags,
  onAddSuggestedTag,
  onRemoveTag,
  onFocusTag,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { showToast, confirm } = useToast();
  const isDark = theme === "dark";

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [newTagsInput, setNewTagsInput] = useState("");
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [isSubmittingTags, setIsSubmittingTags] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Filter counts
  const counts = useMemo(() => {
    return {
      all: tags.length,
      top10: tags.filter((t) => typeof t.currentRank === "number" && t.currentRank >= 1 && t.currentRank <= 10).length,
      potential: tags.filter((t) => typeof t.currentRank === "number" && t.currentRank > 10 && t.currentRank <= 30).length,
      lost: tags.filter((t) => t.currentRank === null || t.currentRank <= 0).length,
    };
  }, [tags]);

  // Filtered & Sorted items
  const processedTags = useMemo(() => {
    let list = [...tags];

    // 1. Filter by status tab
    if (activeFilter === "top10") {
      list = list.filter((t) => typeof t.currentRank === "number" && t.currentRank >= 1 && t.currentRank <= 10);
    } else if (activeFilter === "potential") {
      list = list.filter((t) => typeof t.currentRank === "number" && t.currentRank > 10 && t.currentRank <= 30);
    } else if (activeFilter === "lost") {
      list = list.filter((t) => t.currentRank === null || t.currentRank <= 0);
    }

    // 2. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((t) => t.tag.toLowerCase().includes(q));
    }

    // 3. Sorting
    list.sort((a, b) => {
      if (sortField === "name") {
        return sortDirection === "asc"
          ? a.tag.localeCompare(b.tag)
          : b.tag.localeCompare(a.tag);
      }
      if (sortField === "trend") {
        const trendA = getTrend(a.tag, a.currentRank);
        const trendB = getTrend(b.tag, b.currentRank);
        return sortDirection === "asc" ? trendA - trendB : trendB - trendA;
      }
      // sort by rank
      const rankA = a.currentRank === null || a.currentRank <= 0 ? 9999 : a.currentRank;
      const rankB = b.currentRank === null || b.currentRank <= 0 ? 9999 : b.currentRank;
      return sortDirection === "asc" ? rankA - rankB : rankB - rankA;
    });

    return list;
  }, [tags, activeFilter, searchQuery, sortField, sortDirection, getTrend]);

  const handleSortToggle = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag).then(() => {
      setCopiedTag(tag);
      showToast(`#${tag} скопирован в буфер!`, "success", undefined, 1500);
      setTimeout(() => setCopiedTag(null), 1500);
    });
  };

  const handleCopyForBehance = () => {
    if (processedTags.length === 0) return;
    const text = processedTags.map((t) => t.tag.replace(/^#/, "").trim()).join(", ");
    navigator.clipboard.writeText(text).then(() => {
      showToast("Теги скопированы для настроек кейса на Behance (без #)", "success");
    });
  };

  const handleCopyAsHashtags = () => {
    if (processedTags.length === 0) return;
    const text = processedTags.map((t) => `#${t.tag.replace(/^#/, "").trim()}`).join(" ");
    navigator.clipboard.writeText(text).then(() => {
      showToast("Хэштеги скопированы для соцсетей (#tag)", "success");
    });
  };

  const handleAddQuickTag = (tag: string) => {
    const existing = newTagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (!existing.includes(tag)) {
      const next = [...existing, tag].join(", ");
      setNewTagsInput(next);
    }
  };

  const handleAddTagsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagsInput.trim() || isSubmittingTags) return;

    setIsSubmittingTags(true);
    try {
      await onAddCustomTags(newTagsInput.trim());
      setNewTagsInput("");
      setShowAddForm(false);
    } finally {
      setIsSubmittingTags(false);
    }
  };

  const handleDeleteTagClick = (tagName: string) => {
    if (!onRemoveTag) return;
    confirm({
      title: `Удалить #${tagName}?`,
      message: `Тег #${tagName} будет отключен от активного мониторинга этого кейса. История его позиций сохранится в общей базе.`,
      confirmText: "Удалить из мониторинга",
      cancelText: "Отмена",
      onConfirm: async () => {
        await onRemoveTag(tagName);
      },
    });
  };

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all ${
        isDark ? "bg-[#141418] border-white/10" : "bg-white border-zinc-200 shadow-xs"
      }`}
    >
      {/* 1. TOP CONTROLS & SEARCH BAR */}
      <div className="p-4 md:p-5 border-b border-zinc-200 dark:border-white/10 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        {/* FILTER TABS */}
        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-white/5 rounded-xl overflow-x-auto">
          {[
            { id: "all", label: `Все (${counts.all})` },
            { id: "top10", label: `В ТОП-10 (${counts.top10})` },
            { id: "potential", label: `Потенциал (${counts.potential})` },
            { id: "lost", label: `Вне поиска (${counts.lost})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id as any)}
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeFilter === f.id
                  ? "bg-white dark:bg-behance-blue text-black dark:text-white shadow-xs"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* SEARCH & ACTIONS */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* SEARCH INPUT */}
          <div className="relative flex-1 sm:w-48">
            <input
              type="text"
              placeholder="Поиск по тегам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium outline-none border transition-all ${
                isDark
                  ? "bg-white/5 border-white/10 text-white focus:border-behance-blue"
                  : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-behance-blue"
              }`}
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs opacity-40">
              🔍
            </span>
          </div>

          {/* EXPORT BUTTONS */}
          <button
            onClick={handleCopyForBehance}
            type="button"
            title="Скопировать чистый список тегов через запятую для вставки в кейс Behance"
            className="px-3 py-1.5 rounded-xl bg-behance-blue text-white text-xs font-bold hover:bg-behance-darkBlue transition-all cursor-pointer shadow-xs flex items-center gap-1 shrink-0"
          >
            <span>🎯</span>
            <span>Для Behance</span>
          </button>

          <button
            onClick={handleCopyAsHashtags}
            type="button"
            title="Скопировать как хэштеги #tag"
            className="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            #Хэштеги
          </button>

          <button
            onClick={onToggleAllTags}
            type="button"
            className="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            {visibleTags.length === tags.length ? "Скрыть все" : "Показать все"}
          </button>

          {hasCustomTags && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              type="button"
              className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white text-xs font-bold transition-all cursor-pointer shrink-0"
            >
              {showAddForm ? "✕" : "+ Теги"}
            </button>
          )}
        </div>
      </div>

      {/* 2. SMART SUGGESTIONS BAR (KILLER FEATURE) */}
      {suggestedTags && suggestedTags.length > 0 && onAddSuggestedTag && (
        <div className="px-4 md:px-6 py-3 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent border-b border-zinc-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">💡</span>
            <div>
              <span className="text-xs font-bold text-behance-blue block">
                Рекомендованные нишевые теги (вне основных 10):
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {suggestedTags.map((sugTag) => (
              <button
                key={sugTag}
                onClick={() => onAddSuggestedTag(sugTag)}
                type="button"
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/10 hover:bg-behance-blue hover:text-white dark:hover:bg-behance-blue text-behance-blue dark:text-blue-300 text-[10px] font-bold uppercase tracking-tight border border-blue-500/20 shadow-xs transition-all cursor-pointer flex items-center gap-1"
              >
                <span>＋</span>
                <span>#{sugTag}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. EXPANDABLE ADD CUSTOM TAGS FORM */}
      {showAddForm && hasCustomTags && (
        <div className="p-4 border-b border-zinc-200 dark:border-white/10 bg-behance-blue/5 space-y-2.5">
          <form onSubmit={handleAddTagsSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Введите теги через запятую (например: figma, mobile app, dashboard)..."
              value={newTagsInput}
              onChange={(e) => setNewTagsInput(e.target.value)}
              className={`flex-1 rounded-xl px-4 py-2 text-xs font-medium outline-none border transition-all ${
                isDark
                  ? "bg-black/50 border-white/10 text-white focus:border-behance-blue"
                  : "bg-white border-zinc-200 text-zinc-900 focus:border-behance-blue"
              }`}
            />
            <button
              type="submit"
              disabled={isSubmittingTags || !newTagsInput.trim()}
              className="px-5 py-2 rounded-xl bg-behance-blue text-white text-xs font-bold uppercase disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmittingTags ? "Сканирование..." : "Добавить"}
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold opacity-50 mr-1">
              Быстрые теги:
            </span>
            {QUICK_TAG_SUGGESTIONS.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => handleAddQuickTag(sug)}
                className="px-2 py-0.5 rounded-md bg-white/60 dark:bg-white/10 hover:bg-behance-blue hover:text-white text-[10px] font-medium transition-all cursor-pointer"
              >
                +{sug}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. INTERACTIVE POWER TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-white/10 text-[10px] font-bold uppercase tracking-wider opacity-60 bg-zinc-50/50 dark:bg-white/5 select-none">
              <th
                onClick={() => handleSortToggle("name")}
                className="px-5 py-3 cursor-pointer hover:opacity-100"
              >
                <div className="flex items-center gap-1">
                  <span>Тег</span>
                  {sortField === "name" && (
                    <span>{sortDirection === "asc" ? "▲" : "▼"}</span>
                  )}
                </div>
              </th>

              <th
                onClick={() => handleSortToggle("rank")}
                className="px-5 py-3 text-center cursor-pointer hover:opacity-100"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Позиция в поиске</span>
                  {sortField === "rank" && (
                    <span>{sortDirection === "asc" ? "▲" : "▼"}</span>
                  )}
                </div>
              </th>

              <th
                onClick={() => handleSortToggle("trend")}
                className="px-5 py-3 text-center cursor-pointer hover:opacity-100"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>24ч Динамика</span>
                  {sortField === "trend" && (
                    <span>{sortDirection === "asc" ? "▲" : "▼"}</span>
                  )}
                </div>
              </th>

              <th className="px-5 py-3 text-right">На графике</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
            {processedTags.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-xs font-bold opacity-40">
                  {searchQuery ? "По запросу ничего не найдено" : "Нет тегов в этой категории"}
                </td>
              </tr>
            ) : (
              processedTags.map((item) => {
                const rank = item.currentRank;
                const isTop = rank !== null && rank >= 1 && rank <= 10;
                const isChecking = isBusy && (rank === null || rank === undefined);
                const trend = getTrend(item.tag, rank);
                const isVisible = visibleTags.includes(item.tag);

                return (
                  <tr
                    key={item.tag}
                    onMouseEnter={() => onFocusTag(item.tag)}
                    onMouseLeave={() => onFocusTag(null)}
                    className={`transition-colors group ${
                      isDark ? "hover:bg-white/5 text-zinc-200" : "hover:bg-zinc-50 text-zinc-900"
                    }`}
                  >
                    {/* TAG NAME & TOOLS */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: tagColors[item.tag] || "#0057ff" }}
                        />
                        <span
                          className={`text-xs font-bold transition-opacity ${
                            isVisible ? "opacity-100" : "opacity-40"
                          }`}
                        >
                          #{item.tag}
                        </span>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                          <button
                            onClick={() => handleCopyTag(item.tag)}
                            type="button"
                            title="Скопировать тег"
                            className="p-1 rounded-md bg-zinc-100 dark:bg-white/10 hover:bg-behance-blue hover:text-white text-xs transition-colors cursor-pointer"
                          >
                            {copiedTag === item.tag ? "✓" : "📋"}
                          </button>

                          <a
                            href={`https://www.behance.net/search/projects?search=${encodeURIComponent(item.tag)}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Открыть поиск Behance"
                            className="p-1 rounded-md bg-zinc-100 dark:bg-white/10 hover:bg-behance-blue hover:text-white text-xs transition-colors"
                          >
                            ↗
                          </a>

                          {onRemoveTag && (
                            <button
                              onClick={() => handleDeleteTagClick(item.tag)}
                              type="button"
                              title="Удалить тег из мониторинга"
                              className="p-1 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-xs transition-colors cursor-pointer"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* CURRENT RANK */}
                    <td className="px-5 py-3 text-center font-bold">
                      {isChecking ? (
                        <span className="text-blue-500 animate-pulse text-[10px] italic">
                          🤖 Проверка...
                        </span>
                      ) : !rank || rank <= 0 ? (
                        <span className="text-zinc-400 text-[10px]">
                          Вне Топ-100
                        </span>
                      ) : (
                        <span
                          className={`text-xs font-black px-2 py-0.5 rounded-md ${
                            isTop
                              ? "bg-green-500/10 text-green-500 border border-green-500/20"
                              : "text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          #{rank}
                        </span>
                      )}
                    </td>

                    {/* 24H TREND */}
                    <td className="px-5 py-3 text-center font-bold">
                      {!hasTrends ? (
                        <span className="opacity-30 text-xs" title="Доступно на тарифе Pro Stream">
                          🔒
                        </span>
                      ) : isChecking ? (
                        <span className="opacity-20">•</span>
                      ) : trend !== 0 ? (
                        <span
                          className={`text-[10px] font-black uppercase ${
                            trend > 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {trend > 0 ? `▲ +${trend}` : `▼ ${trend}`}
                        </span>
                      ) : (
                        <span className="opacity-20 font-black">•</span>
                      )}
                    </td>

                    {/* STATUS & CHART TOGGLE */}
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={(e) => onToggleTag(e, item.tag)}
                          type="button"
                          aria-label={`Toggle tag ${item.tag}`}
                          className={`w-8 h-4 rounded-full relative transition-all duration-200 cursor-pointer ${
                            isVisible ? "bg-behance-blue" : isDark ? "bg-white/10" : "bg-zinc-300"
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${
                              isVisible ? "left-4.5" : "left-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
