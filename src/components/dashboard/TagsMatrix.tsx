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

export const TagsMatrix: React.FC<TagsMatrixProps> = ({
  tags,
  activeFilter,
  hasCustomTags,
  isBusy,
  getTrend,
  onFilterChange,
  onAddCustomTags,
  onRemoveTag,
}) => {
  const { theme } = useTheme();
  const { showToast, confirm } = useToast();
  const isDark = theme === "dark";

  const [searchQuery, setSearchQuery] = useState("");
  const [newTagsInput, setNewTagsInput] = useState("");
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [isSubmittingTags, setIsSubmittingTags] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCopyMenu, setShowCopyMenu] = useState(false);
  const [onlyRising, setOnlyRising] = useState(false);

  // Stats calculation for filter chips
  const top10Count = useMemo(
    () => tags.filter((t) => typeof t.currentRank === "number" && t.currentRank >= 1 && t.currentRank <= 10).length,
    [tags]
  );
  const potentialCount = useMemo(
    () => tags.filter((t) => typeof t.currentRank === "number" && t.currentRank > 10 && t.currentRank <= 30).length,
    [tags]
  );
  const lostCount = useMemo(
    () => tags.filter((t) => t.currentRank === null || t.currentRank <= 0).length,
    [tags]
  );
  const risingCount = useMemo(
    () => tags.filter((t) => getTrend(t.tag, t.currentRank) > 0).length,
    [tags, getTrend]
  );

  // Filter and sort tags
  const processedTags = useMemo(() => {
    let list = [...tags];

    if (activeFilter === "top10") {
      list = list.filter((t) => typeof t.currentRank === "number" && t.currentRank >= 1 && t.currentRank <= 10);
    } else if (activeFilter === "potential") {
      list = list.filter((t) => typeof t.currentRank === "number" && t.currentRank > 10 && t.currentRank <= 30);
    } else if (activeFilter === "lost") {
      list = list.filter((t) => t.currentRank === null || t.currentRank <= 0);
    }

    if (onlyRising) {
      list = list.filter((t) => getTrend(t.tag, t.currentRank) > 0);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((t) => t.tag.toLowerCase().includes(q));
    }

    // Sort by best rank first
    list.sort((a, b) => {
      const rankA = a.currentRank === null || a.currentRank <= 0 ? 9999 : a.currentRank;
      const rankB = b.currentRank === null || b.currentRank <= 0 ? 9999 : b.currentRank;
      return rankA - rankB;
    });

    return list;
  }, [tags, activeFilter, searchQuery, onlyRising, getTrend]);

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag).then(() => {
      setCopiedTag(tag);
      showToast(`#${tag} скопирован!`, "success", undefined, 1500);
      setTimeout(() => setCopiedTag(null), 1500);
    });
  };

  const handleCopyFormattedTags = (format: "comma" | "hashtags" | "top10") => {
    let tagsToCopy: string[] = [];

    if (format === "top10") {
      tagsToCopy = tags
        .filter((t) => typeof t.currentRank === "number" && t.currentRank >= 1 && t.currentRank <= 10)
        .map((t) => t.tag);
    } else {
      tagsToCopy = tags.map((t) => t.tag);
    }

    if (tagsToCopy.length === 0) {
      showToast("Нет тегов для копирования", "info");
      setShowCopyMenu(false);
      return;
    }

    let result = "";
    if (format === "hashtags") {
      result = tagsToCopy.map((t) => `#${t}`).join(" ");
    } else {
      result = tagsToCopy.join(", ");
    }

    navigator.clipboard.writeText(result).then(() => {
      showToast(`Скопировано ${tagsToCopy.length} тегов в буфер обмена! 📋`, "success");
      setShowCopyMenu(false);
    });
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
      message: `Тег #${tagName} больше не будет проверяться для этого кейса.`,
      confirmText: "Удалить",
      cancelText: "Отмена",
      onConfirm: async () => {
        await onRemoveTag(tagName);
      },
    });
  };

  return (
    <div
      className={`p-5 md:p-6 rounded-2xl border transition-all space-y-4 ${
        isDark ? "bg-[#121216] border-white/10" : "bg-white border-zinc-200 shadow-sm"
      }`}
    >
      {/* 1. HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-zinc-200 dark:border-white/10">
        <div>
          <h3 className="text-base font-black">
            Список тегов кейса ({processedTags.length})
          </h3>
          <p className="text-xs opacity-50 font-medium">
            Реальные позиции вашего кейса в поисковой выдаче Behance
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {/* SEARCH */}
          <div className="relative flex-1 sm:w-44">
            <input
              type="text"
              placeholder="Поиск по тегам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-xl pl-7 pr-3 py-1.5 text-xs font-medium outline-none border transition-all ${
                isDark
                  ? "bg-white/5 border-white/10 text-white focus:border-behance-blue"
                  : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-behance-blue"
              }`}
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs opacity-40">
              🔍
            </span>
          </div>

          {/* COPY DROPDOWN BUTTON */}
          <div className="relative">
            <button
              onClick={() => setShowCopyMenu(!showCopyMenu)}
              type="button"
              className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>📋</span>
              <span>{t("dashboard.matrix.copyDropdown")}</span>
            </button>

            {showCopyMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-56 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-2xl p-2 z-30 animate-in fade-in space-y-1">
                <button
                  onClick={() => handleCopyFormattedTags("comma")}
                  type="button"
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <span>{t("dashboard.matrix.copyComma")}</span>
                  <span className="text-[10px] opacity-40">tag1, tag2</span>
                </button>
                <button
                  onClick={() => handleCopyFormattedTags("hashtags")}
                  type="button"
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <span>{t("dashboard.matrix.copyHashtags")}</span>
                  <span className="text-[10px] opacity-40">#tag1 #tag2</span>
                </button>
                <button
                  onClick={() => handleCopyFormattedTags("top10")}
                  type="button"
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-green-500 hover:bg-green-500/10 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <span>{t("dashboard.matrix.copyOnlyTop10")}</span>
                  <span className="text-[10px] opacity-60">({top10Count})</span>
                </button>
              </div>
            )}
          </div>

          {/* ADD TAGS BUTTON */}
          {hasCustomTags && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              type="button"
              className="px-3 py-1.5 rounded-xl bg-behance-blue/10 hover:bg-behance-blue hover:text-white text-behance-blue text-xs font-bold transition-all cursor-pointer shrink-0"
            >
              {showAddForm ? t("dashboard.matrix.cancelBtn") : t("dashboard.matrix.addTagBtn")}
            </button>
          )}
        </div>
      </div>

      {/* 2. SMART FILTER CHIPS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => {
            onFilterChange("all");
            setOnlyRising(false);
          }}
          type="button"
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeFilter === "all" && !onlyRising
              ? "bg-behance-blue text-white shadow-xs"
              : "bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10"
          }`}
        >
          {t("dashboard.matrix.filterAll")} ({tags.length})
        </button>

        <button
          onClick={() => {
            onFilterChange("top10");
            setOnlyRising(false);
          }}
          type="button"
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeFilter === "top10" && !onlyRising
              ? "bg-green-500 text-white shadow-xs"
              : "bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20"
          }`}
        >
          <span>{t("dashboard.matrix.filterTop10")}</span>
          <span className="opacity-75 font-mono">({top10Count})</span>
        </button>

        <button
          onClick={() => {
            onFilterChange("potential");
            setOnlyRising(false);
          }}
          type="button"
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeFilter === "potential" && !onlyRising
              ? "bg-amber-500 text-white shadow-xs"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
          }`}
        >
          <span>{t("dashboard.matrix.filterPotential")}</span>
          <span className="opacity-75 font-mono">({potentialCount})</span>
        </button>

        <button
          onClick={() => {
            onFilterChange("lost");
            setOnlyRising(false);
          }}
          type="button"
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeFilter === "lost" && !onlyRising
              ? "bg-zinc-600 text-white shadow-xs"
              : "bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-white/10"
          }`}
        >
          <span>{t("dashboard.matrix.filterLost")}</span>
          <span className="opacity-75 font-mono">({lostCount})</span>
        </button>

        {risingCount > 0 && (
          <button
            onClick={() => setOnlyRising(!onlyRising)}
            type="button"
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              onlyRising
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
            }`}
          >
            <span>{t("dashboard.matrix.filterRising")}</span>
            <span className="opacity-75 font-mono">({risingCount})</span>
          </button>
        )}
      </div>

      {/* 3. EXPANDABLE ADD TAG FORM */}
      {showAddForm && hasCustomTags && (
        <form
          onSubmit={handleAddTagsSubmit}
          className="p-3 rounded-xl bg-behance-blue/5 border border-behance-blue/20 flex gap-2 animate-in fade-in"
        >
          <input
            type="text"
            placeholder={t("dashboard.matrix.inputPlaceholder")}
            value={newTagsInput}
            onChange={(e) => setNewTagsInput(e.target.value)}
            className={`flex-1 rounded-lg px-3 py-2 text-xs outline-none border ${
              isDark ? "bg-black/50 border-white/10 text-white" : "bg-white border-zinc-200"
            }`}
          />
          <button
            type="submit"
            disabled={isSubmittingTags || !newTagsInput.trim()}
            className="px-4 py-2 rounded-lg bg-behance-blue text-white text-xs font-bold uppercase disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isSubmittingTags ? t("dashboard.matrix.checkingBtn") : t("dashboard.matrix.checkBtn")}
          </button>
        </form>
      )}

      {/* 3.1 SMART SUGGESTED TAGS FROM CASE TITLE & CONTENT */}
      {hasCustomTags && suggestedTags && suggestedTags.length > 0 && onAddSuggestedTag && (
        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            isDark
              ? "bg-gradient-to-r from-blue-950/30 via-purple-950/20 to-transparent border-blue-500/20"
              : "bg-gradient-to-r from-blue-50 to-indigo-50/30 border-blue-200 shadow-xs"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🪄</span>
              <span className="text-xs font-black uppercase tracking-wider text-behance-blue">
                {t("dashboard.matrix.smartTagsTitle")}
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
              {t("dashboard.matrix.smartTagsSubtitle")}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {suggestedTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onAddSuggestedTag(tag)}
                disabled={isBusy}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-white/10 hover:bg-behance-blue hover:text-white dark:hover:bg-behance-blue border border-zinc-200 dark:border-white/10 text-xs font-medium transition-all shadow-xs cursor-pointer flex items-center gap-1 shrink-0 disabled:opacity-50"
              >
                <span className="font-bold text-behance-blue">＋</span>
                <span>#{tag}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. TAGS CARDS LIST */}
      <div className="space-y-2">
        {processedTags.length === 0 ? (
          <div className="py-8 text-center text-xs opacity-50 font-medium">
            {searchQuery
              ? t("dashboard.matrix.emptySearch")
              : activeFilter !== "all" || onlyRising
                ? t("dashboard.matrix.emptyFilter")
                : t("dashboard.matrix.emptyState")}
          </div>
        ) : (
          processedTags.map((item) => {
            const rank = item.currentRank;
            const isTop = rank !== null && rank >= 1 && rank <= 10;
            const isPotential = rank !== null && rank > 10 && rank <= 30;
            const isChecking = isBusy && (rank === null || rank === undefined);
            const trend = getTrend(item.tag, rank);

            return (
              <div
                key={item.tag}
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                  isTop
                    ? "bg-green-500/5 border-green-500/30 hover:border-green-500/50"
                    : isPotential
                      ? "bg-amber-500/5 border-amber-500/30 hover:border-amber-500/50"
                      : isDark
                        ? "bg-white/5 border-white/5 hover:border-white/10"
                        : "bg-zinc-50 border-zinc-200 hover:border-zinc-300"
                }`}
              >
                {/* TAG NAME & STATUS TEXT */}
                <div className="flex items-center gap-3">
                  <span
                    className={`w-3 h-3 rounded-full shrink-0 ${
                      isTop
                        ? "bg-green-500 animate-pulse"
                        : isPotential
                          ? "bg-amber-500"
                          : "bg-zinc-400 opacity-40"
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-behance-black dark:text-white">
                        #{item.tag}
                      </span>
                      <button
                        onClick={() => handleCopyTag(item.tag)}
                        type="button"
                        className="text-[10px] opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
                        title="Copy tag"
                      >
                        {copiedTag === item.tag ? "✓" : "📋"}
                      </button>
                    </div>

                    <div className="text-[11px] font-medium opacity-60 mt-0.5">
                      {isTop && `🔥 ${t("dashboard.matrix.statusTop")}`}
                      {isPotential && `🟡 ${t("dashboard.matrix.statusPotential")}`}
                      {!isTop && !isPotential && rank && rank > 0 && `#${rank}`}
                      {(!rank || rank <= 0) && t("dashboard.matrix.statusLost")}
                    </div>
                  </div>
                </div>

                {/* RANK BADGE & ACTIONS */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  {/* TREND BADGE */}
                  {trend !== 0 && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        trend > 0
                          ? "bg-green-500/10 text-green-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {trend > 0 ? `▲ +${trend}` : `▼ ${trend}`}
                    </span>
                  )}

                  {/* RANK PILL */}
                  <div
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black shrink-0 ${
                      isTop
                        ? "bg-green-500 text-white shadow-xs"
                        : isPotential
                          ? "bg-amber-500 text-white shadow-xs"
                          : "bg-zinc-200 dark:bg-white/10 text-zinc-600 dark:text-zinc-300"
                    }`}
                  >
                    {isChecking
                      ? `⏳ ${t("dashboard.matrix.statusChecking")}`
                      : rank && rank > 0
                        ? `#${rank}`
                        : ">100"}
                  </div>

                  {/* REMOVE TAG */}
                  {onRemoveTag && (
                    <button
                      onClick={() => handleDeleteTagClick(item.tag)}
                      type="button"
                      className="text-xs opacity-30 hover:opacity-100 hover:text-red-500 transition-all p-1 cursor-pointer"
                      title="Delete tag"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
