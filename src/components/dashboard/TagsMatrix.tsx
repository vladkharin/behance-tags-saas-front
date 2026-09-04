import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContextInstance";
import { useToast } from "../../context/ToastContext";
import type { TagMatrixItem } from "../../types/analytics.types";
import { HybridTagInput } from "../ui/HybridTagInput";

interface TagsMatrixProps {
  tags: TagMatrixItem[];
  visibleTags: string[];
  suggestedTags?: string[];
  tagColors: Record<string, string>;
  activeFilter: "all" | "top10" | "potential" | "lost";
  hasCustomTags: boolean;
  hasTrends?: boolean;
  isDemoMode: boolean;
  isBusy: boolean;
  getTrend?: (tag: string, rank: number | null) => number;
  onFilterChange?: (filter: "all" | "top10" | "potential" | "lost") => void;
  onToggleTag: (e: React.MouseEvent, tagName: string) => void;
  onToggleAllTags: () => void;
  onAddCustomTags: (tags: string) => Promise<void>;
  onAddSuggestedTag?: (tagName: string) => Promise<void>;
  onRemoveTag?: (tagName: string) => Promise<void>;
  onFocusTag: (tag: string | null) => void;
}

export const TagsMatrix: React.FC<TagsMatrixProps> = ({
  tags,
  suggestedTags,
  activeFilter,
  hasCustomTags,
  isBusy,
  getTrend,
  onFilterChange,
  onAddCustomTags,
  onAddSuggestedTag,
  onRemoveTag,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { showToast, confirm } = useToast();
  const isDark = theme === "dark";

  const [searchQuery, setSearchQuery] = useState("");
  const [newTagsInput, setNewTagsInput] = useState("");
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [isSubmittingTags, setIsSubmittingTags] = useState(false);
  const [isAddingAll, setIsAddingAll] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCopyMenu, setShowCopyMenu] = useState(false);
  const [onlyRising, setOnlyRising] = useState(false);

  const handleAddAllSuggestedTags = async () => {
    if (!suggestedTags || suggestedTags.length === 0 || isAddingAll || isBusy) return;
    setIsAddingAll(true);
    try {
      await onAddCustomTags(suggestedTags.join(", "));
    } finally {
      setIsAddingAll(false);
    }
  };

  // Stats calculation for filter chips
  const top10Count = useMemo(
    () => tags.filter((t) => typeof t.currentRank === "number" && t.currentRank >= 1 && t.currentRank <= 10).length,
    [tags]
  );
  const potentialCount = useMemo(
    () => tags.filter((t) => typeof t.currentRank === "number" && t.currentRank > 10 && t.currentRank <= 30).length,
    [tags]
  );
  const getTagTrend = useCallback(
    (item: TagMatrixItem): number => {
      if (getTrend) return getTrend(item.tag, item.currentRank);
      if (typeof item.currentRank === "number" && typeof item.previousRank === "number") {
        return item.previousRank - item.currentRank;
      }
      return 0;
    },
    [getTrend]
  );

  const lostCount = useMemo(
    () => tags.filter((t) => t.currentRank === null || t.currentRank <= 0).length,
    [tags]
  );
  const risingCount = useMemo(
    () => tags.filter((t) => getTagTrend(t) > 0).length,
    [tags, getTagTrend]
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
      list = list.filter((t) => getTagTrend(t) > 0);
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
  }, [tags, activeFilter, searchQuery, onlyRising, getTagTrend]);

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag).then(() => {
      setCopiedTag(tag);
      showToast(t("dashboard.matrix.tagCopiedToast", { tag }), "success", undefined, 1500);
      setTimeout(() => setCopiedTag(null), 2000);
    });
  };

  const handleCopyFormattedTags = (
    format: "comma" | "excel" | "hashtags" | "quotes" | "top10" | "top10_excel"
  ) => {
    let tagsToCopy = tags.map((t) => t.tag);

    if (format === "top10" || format === "top10_excel") {
      tagsToCopy = tags
        .filter((t) => typeof t.currentRank === "number" && t.currentRank >= 1 && t.currentRank <= 10)
        .map((t) => t.tag);
    }

    if (tagsToCopy.length === 0) {
      showToast(t("dashboard.matrix.noTagsToCopy"), "info");
      setShowCopyMenu(false);
      return;
    }

    let result = "";
    if (format === "hashtags") {
      result = tagsToCopy.map((t) => `#${t.replace(/^#+/, "")}`).join(" ");
    } else if (format === "excel" || format === "top10_excel") {
      result = tagsToCopy.join("\n");
    } else if (format === "quotes") {
      result = tagsToCopy.map((t) => `"${t}"`).join(", ");
    } else {
      result = tagsToCopy.join(", ");
    }

    navigator.clipboard.writeText(result).then(() => {
      showToast(t("dashboard.matrix.copiedTagsToast", { count: tagsToCopy.length }), "success");
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
      title: t("dashboard.matrix.deleteConfirmTitle", { tag: tagName }),
      message: t("dashboard.matrix.deleteConfirmMsg", { tag: tagName }),
      confirmText: t("dashboard.matrix.deleteConfirmBtn"),
      cancelText: t("dashboard.matrix.deleteCancelBtn"),
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
            {t("dashboard.matrix.tagListTitle", { count: processedTags.length })}
          </h3>
          <p className="text-xs opacity-50 font-medium">
            {t("dashboard.matrix.tagListSubtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {/* SEARCH */}
          <div className="relative flex-1 sm:w-44">
            <input
              type="text"
              placeholder={t("dashboard.matrix.searchPlaceholder")}
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
              <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white dark:bg-[#141418] border border-zinc-200 dark:border-white/10 shadow-2xl p-2 z-40 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {t("dashboard.matrix.allTagsHeading", { count: processedTags.length })}
                </div>

                <button
                  onClick={() => handleCopyFormattedTags("comma")}
                  type="button"
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-behance-blue">
                    <span>📋</span>
                    <span>{t("dashboard.matrix.copyComma")}</span>
                  </span>
                  <span className="text-[10px] opacity-50 font-mono">tag1, tag2</span>
                </button>

                <button
                  onClick={() => handleCopyFormattedTags("excel")}
                  type="button"
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2 font-bold text-blue-500">
                    <span>📊</span>
                    <span>{t("dashboard.matrix.copyExcel")}</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-mono">
                    Excel \n
                  </span>
                </button>

                <button
                  onClick={() => handleCopyFormattedTags("hashtags")}
                  type="button"
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-behance-blue">
                    <span>#️⃣</span>
                    <span>{t("dashboard.matrix.copyHashtags")}</span>
                  </span>
                  <span className="text-[10px] opacity-50 font-mono">#tag1 #tag2</span>
                </button>

                <button
                  onClick={() => handleCopyFormattedTags("quotes")}
                  type="button"
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-behance-blue">
                    <span>💬</span>
                    <span>{t("dashboard.matrix.copyQuotes")}</span>
                  </span>
                  <span className="text-[10px] opacity-50 font-mono">"tag1"</span>
                </button>

                {top10Count > 0 && (
                  <>
                    <div className="pt-2 my-1 border-t border-zinc-200 dark:border-white/10 px-3 text-[10px] font-black uppercase tracking-wider text-green-500 flex items-center justify-between">
                      <span>{t("dashboard.matrix.top10Heading", { count: top10Count })}</span>
                      <span className="text-[10px]">🔥</span>
                    </div>

                    <button
                      onClick={() => handleCopyFormattedTags("top10")}
                      type="button"
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-green-600 dark:text-green-400 hover:bg-green-500/10 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2 font-bold">
                        <span>🏆</span>
                        <span>{t("dashboard.matrix.copyOnlyTop10")}</span>
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/15 font-mono font-black">
                        ({top10Count})
                      </span>
                    </button>

                    <button
                      onClick={() => handleCopyFormattedTags("top10_excel")}
                      type="button"
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-green-600 dark:text-green-400 hover:bg-green-500/10 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2 font-bold">
                        <span>📊</span>
                        <span>{t("dashboard.matrix.copyTop10Excel")}</span>
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/15 font-mono font-black">
                        Excel \n
                      </span>
                    </button>
                  </>
                )}
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
          className="p-4 rounded-2xl bg-behance-blue/5 border border-behance-blue/20 space-y-3 animate-in fade-in"
        >
          <HybridTagInput
            value={newTagsInput}
            onChange={setNewTagsInput}
            isDark={isDark}
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-white/10 text-xs font-bold transition-all cursor-pointer"
            >
              {t("dashboard.matrix.deleteCancelBtn")}
            </button>
            <button
              type="submit"
              disabled={isSubmittingTags || !newTagsInput.trim()}
              className="px-5 py-2 rounded-xl bg-behance-blue text-white text-xs font-black uppercase tracking-wider disabled:opacity-50 cursor-pointer shadow-sm shadow-blue-500/20"
            >
              {isSubmittingTags ? t("dashboard.matrix.checkingBtn") : t("dashboard.matrix.checkBtn")}
            </button>
          </div>
        </form>
      )}

      {/* 3.1 SMART SUGGESTED TAGS FROM CASE TITLE & CONTENT */}
      {hasCustomTags && suggestedTags && suggestedTags.length > 0 && onAddSuggestedTag && (
        <div
          className={`p-3.5 md:p-4 rounded-2xl border transition-all ${
            isDark
              ? "bg-gradient-to-r from-blue-950/30 via-purple-950/20 to-transparent border-blue-500/20"
              : "bg-gradient-to-r from-blue-50 to-indigo-50/30 border-blue-200 shadow-xs"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">🪄</span>
              <span className="text-xs font-black uppercase tracking-wider text-behance-blue">
                {t("dashboard.matrix.smartTagsTitle")}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-behance-blue/15 text-behance-blue font-black font-mono">
                {suggestedTags.length}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium hidden md:inline">
                {t("dashboard.matrix.smartTagsSubtitle")}
              </span>

              <button
                type="button"
                onClick={handleAddAllSuggestedTags}
                disabled={isBusy || isAddingAll}
                className="px-3.5 py-1.5 rounded-xl bg-behance-blue hover:bg-behance-darkBlue text-white text-xs font-bold shadow-sm cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95"
              >
                <span>{isAddingAll ? t("dashboard.matrix.addingAll") : t("dashboard.matrix.addAllBtn", { count: suggestedTags.length })}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-behance-blue/20">
            {suggestedTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onAddSuggestedTag(tag)}
                disabled={isBusy || isAddingAll}
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
            const trend = getTagTrend(item);

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
