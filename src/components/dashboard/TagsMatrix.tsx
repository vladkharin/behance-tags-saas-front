import React, { useState } from "react";
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

  const [newTagsInput, setNewTagsInput] = useState("");
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [isSubmittingTags, setIsSubmittingTags] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag).then(() => {
      setCopiedTag(tag);
      showToast(`#${tag} скопирован в буфер!`, "success", undefined, 1500);
      setTimeout(() => setCopiedTag(null), 1500);
    });
  };

  // 1. Копирование для настроек Behance (через запятую без решеток)
  const handleCopyForBehance = () => {
    if (tags.length === 0) return;
    const text = tags.map((t) => t.tag.replace(/^#/, "").trim()).join(", ");
    navigator.clipboard.writeText(text).then(() => {
      showToast("Теги скопированы для настроек кейса на Behance (без #)", "success");
    });
  };

  // 2. Копирование как хэштеги
  const handleCopyAsHashtags = () => {
    if (tags.length === 0) return;
    const text = tags.map((t) => `#${t.tag.replace(/^#/, "").trim()}`).join(" ");
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
      className={`rounded-[2.5rem] md:rounded-[3.5rem] border overflow-hidden transition-all duration-500 ${
        isDark ? "bg-[#111111] border-white/5 shadow-inner" : "bg-white border-behance-border shadow-lg"
      }`}
    >
      {/* HEADER CONTROLS */}
      <div className="px-6 md:px-10 py-6 md:py-8 border-b border-behance-border dark:border-white/5 flex flex-wrap justify-between items-center bg-gray-50/50 dark:bg-white/5 gap-4">
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] opacity-50 italic">
              {t("dashboard.matrix.title")}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-behance-blue/10 text-behance-blue">
              {tags.length}
            </span>
          </div>

          {/* FILTERS */}
          <div className="flex gap-1.5 p-1 bg-behance-grayBg dark:bg-white/5 rounded-xl">
            {(["all", "top10", "potential", "lost"] as const).map((f) => (
              <button
                key={f}
                onClick={() => onFilterChange(f)}
                type="button"
                className={`px-3 md:px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                  activeFilter === f
                    ? "bg-white dark:bg-behance-blue text-black dark:text-white shadow-sm"
                    : "opacity-40 hover:opacity-100"
                }`}
              >
                {t(`dashboard.matrix.filters.${f}`)}
              </button>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-wrap items-center gap-2">
          {/* EXPORT FOR BEHANCE BUTTON */}
          <button
            onClick={handleCopyForBehance}
            type="button"
            title="Скопировать чистый список тегов через запятую для вставки в кейс Behance"
            className="px-3.5 py-1.5 rounded-xl bg-behance-blue text-white text-[10px] font-black uppercase tracking-wider hover:bg-behance-darkBlue transition-all cursor-pointer shadow-sm shadow-blue-500/20 flex items-center gap-1.5"
          >
            <span>🎯</span>
            <span>Для Behance</span>
          </button>

          {/* COPY HASHTAGS BUTTON */}
          <button
            onClick={handleCopyAsHashtags}
            type="button"
            title="Скопировать как хэштеги #tag"
            className="px-3 py-1.5 rounded-xl bg-gray-200 dark:bg-white/5 text-[10px] font-black uppercase tracking-wider hover:opacity-100 opacity-60 transition-all cursor-pointer"
          >
            # Хэштеги
          </button>

          {/* TOGGLE ALL ON CHART */}
          <button
            onClick={onToggleAllTags}
            type="button"
            className="px-3 py-1.5 rounded-xl bg-behance-blue/10 text-behance-blue text-[10px] font-black uppercase tracking-wider hover:bg-behance-blue hover:text-white transition-all cursor-pointer"
          >
            {visibleTags.length === tags.length
              ? t("dashboard.matrix.hideAll")
              : t("dashboard.matrix.showAll")}
          </button>

          {/* ADD CUSTOM TAGS TOGGLE */}
          {hasCustomTags && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              type="button"
              className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-500 text-[10px] font-black uppercase tracking-wider hover:bg-purple-500 hover:text-white transition-all cursor-pointer"
            >
              {showAddForm ? "✕ Закрыть" : "+ Добавить теги"}
            </button>
          )}
        </div>
      </div>

      {/* KILLER FEATURE: SMART SUGGESTED CUSTOM TAGS BAR */}
      {suggestedTags && suggestedTags.length > 0 && onAddSuggestedTag && (
        <div className="px-6 md:px-10 py-4 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent border-b border-behance-border dark:border-white/5 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <span className="text-base">💡</span>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-behance-blue block">
                Рекомендованные теги (вне основных 10):
              </span>
              <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest block">
                Скрытые точки роста из категорий и инструментов этого кейса
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {suggestedTags.map((sugTag) => (
              <button
                key={sugTag}
                onClick={() => onAddSuggestedTag(sugTag)}
                type="button"
                className="px-3 py-1 rounded-xl bg-white dark:bg-white/10 hover:bg-behance-blue hover:text-white dark:hover:bg-behance-blue text-behance-blue dark:text-blue-300 text-[10px] font-black uppercase tracking-tight border border-blue-500/20 shadow-xs transition-all cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95"
              >
                <span>＋</span>
                <span>#{sugTag}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* EXPANDABLE ADD CUSTOM TAGS FORM */}
      {showAddForm && hasCustomTags && (
        <div className="p-6 md:p-8 border-b border-behance-border dark:border-white/5 bg-behance-blue/5 space-y-3 animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleAddTagsSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Введите теги через запятую (например: figma, mobile app, dashboard)..."
              value={newTagsInput}
              onChange={(e) => setNewTagsInput(e.target.value)}
              className={`flex-1 rounded-2xl px-5 py-3 text-xs font-bold outline-none border transition-all ${
                isDark
                  ? "bg-black/50 border-white/10 text-white focus:border-behance-blue"
                  : "bg-white border-gray-200 text-black focus:border-behance-blue"
              }`}
            />
            <button
              type="submit"
              disabled={isSubmittingTags || !newTagsInput.trim()}
              className="px-6 py-3 rounded-2xl bg-behance-blue text-white text-xs font-black uppercase tracking-wider disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmittingTags ? "Добавление..." : "Сканировать"}
            </button>
          </form>

          {/* QUICK SUGGESTIONS */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[9px] font-black uppercase opacity-40 mr-1">
              Быстрые теги:
            </span>
            {QUICK_TAG_SUGGESTIONS.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => handleAddQuickTag(sug)}
                className="px-2 py-0.5 rounded-lg bg-white/50 dark:bg-white/10 hover:bg-behance-blue hover:text-white text-[9px] font-bold uppercase transition-all cursor-pointer"
              >
                +{sug}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-behance-border dark:border-white/5 text-[9px] font-black uppercase tracking-[0.2em] opacity-30 bg-gray-50/20 dark:bg-white/5">
              <th className="px-6 md:px-10 py-4">{t("dashboard.matrix.cols.tag")}</th>
              <th className="px-6 md:px-10 py-4 text-center">{t("dashboard.matrix.cols.rank")}</th>
              <th className="px-6 md:px-10 py-4 text-center">{t("dashboard.matrix.cols.trend")}</th>
              <th className="px-6 md:px-10 py-4 text-right">Управление</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-behance-border dark:divide-white/5">
            {tags.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 md:px-10 py-12 text-center text-xs font-bold uppercase opacity-40">
                  Нет тегов по выбранному фильтру
                </td>
              </tr>
            ) : (
              tags.map((item) => {
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
                    className={`transition-colors duration-150 group ${
                      isDark ? "hover:bg-white/5 text-white" : "hover:bg-behance-grayBg text-behance-black"
                    }`}
                  >
                    {/* TAG NAME & QUICK ACTIONS */}
                    <td className="px-6 md:px-10 py-4">
                      <div className="flex items-center gap-3.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: tagColors[item.tag] || "#0057ff" }}
                        ></div>
                        <span
                          className={`text-xs md:text-sm font-black uppercase tracking-tight transition-opacity ${
                            isVisible ? "opacity-100" : "opacity-35"
                          }`}
                        >
                          #{item.tag}
                        </span>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                          <button
                            onClick={() => handleCopyTag(item.tag)}
                            type="button"
                            title="Копировать тег"
                            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                              copiedTag === item.tag
                                ? "bg-green-500 text-white"
                                : "bg-behance-blue/10 text-behance-blue hover:bg-behance-blue hover:text-white"
                            }`}
                          >
                            {copiedTag === item.tag ? (
                              "✓"
                            ) : (
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                                />
                              </svg>
                            )}
                          </button>

                          <a
                            href={`https://www.behance.net/search/projects?search=${encodeURIComponent(item.tag)}`}
                            target="_blank"
                            rel="noreferrer"
                            title={t("dashboard.matrix.searchLink")}
                            className="p-1.5 rounded-lg bg-gray-500/10 text-gray-500 hover:bg-behance-blue hover:text-white transition-all"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>

                          {/* DELETE TAG BUTTON */}
                          {onRemoveTag && (
                            <button
                              onClick={() => handleDeleteTagClick(item.tag)}
                              type="button"
                              title="Удалить тег из мониторинга"
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* CURRENT RANK */}
                    <td className="px-6 md:px-10 py-4 text-center font-black">
                      {isChecking ? (
                        <span className="text-blue-500 animate-pulse text-[10px] uppercase italic tracking-widest">
                          {t("dashboard.matrix.rankChecking")}
                        </span>
                      ) : !rank || rank <= 0 ? (
                        <span className="text-gray-400 text-[10px] uppercase font-bold">
                          {t("dashboard.matrix.rankOutOfTop")}
                        </span>
                      ) : (
                        <span className={`text-xs md:text-sm font-black ${isTop ? "text-green-500" : ""}`}>
                          #{rank}
                        </span>
                      )}
                    </td>

                    {/* 24H TREND */}
                    <td className="px-6 md:px-10 py-4 text-center font-black">
                      {!hasTrends ? (
                        <span className="opacity-30 text-xs" title="Доступно на тарифе Pro Stream">
                          🔒
                        </span>
                      ) : isChecking ? (
                        <span className="opacity-20">•</span>
                      ) : trend !== 0 ? (
                        <span className={`text-[10px] font-black uppercase ${trend > 0 ? "text-green-500" : "text-red-500"}`}>
                          {trend > 0 ? `▲ ${trend}` : `▼ ${Math.abs(trend)}`}
                        </span>
                      ) : (
                        <span className="opacity-20 font-black">•</span>
                      )}
                    </td>

                    {/* STATUS & CHART TOGGLE */}
                    <td className="px-6 md:px-10 py-4 text-right">
                      <div className="flex items-center justify-end gap-4">
                        {!isChecking &&
                          (() => {
                            if (!hasTrends) {
                              return (
                                <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[8px] font-black bg-gray-500/5 text-gray-400 uppercase tracking-widest opacity-60">
                                  {t("dashboard.matrix.statuses.locked", "ТРЕНДЫ 🔒")}
                                </span>
                              );
                            }
                            if (isTop) {
                              return (
                                <span className="px-2.5 py-1 rounded-full text-[8px] font-black bg-green-500 text-white uppercase tracking-widest shadow-sm shadow-green-500/20">
                                  {t("dashboard.matrix.statuses.top")}
                                </span>
                              );
                            }
                            if (rank && rank > 0) {
                              if (trend > 0) {
                                return (
                                  <span className="px-2.5 py-1 rounded-full text-[8px] font-black bg-behance-blue/10 text-behance-blue uppercase tracking-widest">
                                    {t("dashboard.matrix.statuses.growth")}
                                  </span>
                                );
                              }
                              if (trend < 0) {
                                return (
                                  <span className="px-2.5 py-1 rounded-full text-[8px] font-black bg-red-500/10 text-red-500 uppercase tracking-widest">
                                    {t("dashboard.matrix.statuses.falling")}
                                  </span>
                                );
                              }
                              return (
                                <span className="px-2.5 py-1 rounded-full text-[8px] font-black bg-gray-500/10 text-gray-500 uppercase tracking-widest">
                                  {t("dashboard.matrix.statuses.stable")}
                                </span>
                              );
                            }
                            return null;
                          })()}

                        <button
                          onClick={(e) => onToggleTag(e, item.tag)}
                          type="button"
                          aria-label={`Toggle tag ${item.tag}`}
                          className={`w-9 h-5 rounded-full relative transition-all duration-300 cursor-pointer ${
                            isVisible ? "bg-behance-blue shadow-md shadow-blue-500/30" : isDark ? "bg-white/10" : "bg-gray-200"
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-xs transition-all duration-200 ${
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
