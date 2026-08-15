import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContextInstance";
import { useToast } from "../../context/ToastContext";

interface AddProjectViewProps {
  hasCustomTags: boolean;
  actionLoading: boolean;
  onImport: (url: string, customTags?: string[]) => Promise<void>;
  onTryDemo: () => Promise<void>;
  onOpenMobileMenu: () => void;
  onOpenVideoTutorial?: () => void;
}

const TAG_PRESETS = [
  {
    category: "🎨 UI/UX",
    tags: ["ui/ux", "mobile app", "figma", "landing page", "dashboard", "web design"],
  },
  {
    category: "🧊 3D & Motion",
    tags: ["3d render", "blender", "cinema 4d", "octane", "motion design", "cgi"],
  },
  {
    category: "🔤 Branding",
    tags: ["branding", "visual identity", "logo design", "typography", "packaging"],
  },
  {
    category: "📸 Photo & Art",
    tags: ["photography", "art direction", "illustration", "photoshop", "concept art"],
  },
];

export const AddProjectView: React.FC<AddProjectViewProps> = ({
  hasCustomTags,
  actionLoading,
  onImport,
  onTryDemo,
  onOpenMobileMenu,
  onOpenVideoTutorial,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const isDark = theme === "dark";

  const [urlInput, setUrlInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [showTagsInput, setShowTagsInput] = useState(false);

  // Check if Behance URL is valid
  const isValidBehanceUrl =
    urlInput.trim().includes("behance.net/gallery/") ||
    urlInput.trim().includes("behance.net/");

  const handlePasteFromClipboard = async () => {
    try {
      if (!navigator.clipboard) {
        showToast("Буфер обмена не поддерживается вашим браузером", "warning");
        return;
      }
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setUrlInput(text.trim());
        showToast("Ссылка вставлена из буфера", "info", undefined, 1500);
      }
    } catch {
      showToast("Разрешите доступ к буферу обмена для быстрой вставки", "warning");
    }
  };

  const handleAddPresetTag = (tag: string) => {
    setShowTagsInput(true);
    const existing = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (!existing.includes(tag)) {
      const next = [...existing, tag].join(", ");
      setTagsInput(next);
      showToast(`Тег #${tag} добавлен`, "info", undefined, 1000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || actionLoading) return;

    const customTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    await onImport(urlInput.trim(), customTags.length > 0 ? customTags : undefined);
  };

  return (
    <div className="max-w-2xl mx-auto mt-4 md:mt-8 animate-in fade-in zoom-in-95 duration-500 text-center px-4">
      {/* Mobile menu & Video Tutorial buttons header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onOpenMobileMenu}
          type="button"
          className="lg:hidden p-2.5 rounded-xl bg-white dark:bg-white/5 border border-behance-border dark:border-white/10 text-xs font-bold flex items-center gap-2 cursor-pointer"
        >
          <span>☰</span> Проекты
        </button>

        {onOpenVideoTutorial && (
          <button
            onClick={onOpenVideoTutorial}
            type="button"
            className="ml-auto px-4 py-2 rounded-2xl bg-behance-blue/10 text-behance-blue text-[10px] font-black uppercase tracking-wider hover:bg-behance-blue hover:text-white transition-all cursor-pointer flex items-center gap-2"
          >
            <span>▶️</span>
            <span>Видео-гид (1 мин)</span>
          </button>
        )}
      </div>

      <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic mb-3">
        {t("dashboard.emptyState.title")}
      </h2>
      <p className="text-xs md:text-sm opacity-50 uppercase font-bold tracking-widest mb-8 md:mb-10 px-4 md:px-10 leading-relaxed">
        {t("dashboard.emptyState.subtitle")}
      </p>

      <div
        className={`p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border shadow-2xl transition-all text-left ${
          isDark ? "bg-[#111111] border-white/5 shadow-black" : "bg-white border-behance-border shadow-lg"
        }`}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL INPUT & PASTE BUTTON */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-black uppercase tracking-widest opacity-40">
                URL Кейса Behance
              </label>
              {isValidBehanceUrl && (
                <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span>✓</span> Ссылка распознана
                </span>
              )}
            </div>

            <div className="relative">
              <input
                className={`w-full rounded-2xl md:rounded-3xl pl-6 pr-28 md:pr-32 py-5 md:py-6 text-xs md:text-sm font-bold outline-none border transition-all ${
                  isDark
                    ? "bg-white/5 border-transparent text-white focus:border-behance-blue shadow-inner"
                    : "bg-behance-grayBg border-transparent focus:border-behance-blue shadow-inner text-behance-black"
                } ${isValidBehanceUrl ? "border-green-500/50" : ""}`}
                placeholder={t("dashboard.init.urlPlaceholder", "https://www.behance.net/gallery/...")}
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                required
                disabled={actionLoading}
              />

              <button
                type="button"
                onClick={handlePasteFromClipboard}
                title="Вставить из буфера обмена"
                className="absolute right-3 top-1/2 -translate-y-1/2 px-3.5 py-2 rounded-xl bg-behance-blue/10 hover:bg-behance-blue hover:text-white text-behance-blue text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                📋 Вставить
              </button>
            </div>
          </div>

          {/* CUSTOM TAGS SECTION & PRESETS */}
          {hasCustomTags ? (
            <div className="space-y-4">
              {!showTagsInput ? (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTagsInput(true)}
                    className="text-[10px] font-black uppercase text-behance-blue tracking-widest hover:opacity-70 transition-all cursor-pointer"
                  >
                    {t("dashboard.init.addCustomTags", "+ Добавить свои теги (опционально)")}
                  </button>
                  <span className="text-[9px] opacity-40 font-bold uppercase tracking-wider">
                    или выберите готовые ниже ↓
                  </span>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest opacity-40">
                      Кастомные теги (через запятую)
                    </label>
                    <button
                      type="button"
                      onClick={() => setTagsInput("")}
                      className="text-[9px] font-bold text-red-500 opacity-60 hover:opacity-100"
                    >
                      Очистить
                    </button>
                  </div>
                  <textarea
                    className={`w-full rounded-2xl md:rounded-3xl px-6 md:px-8 py-4 md:py-6 text-xs font-bold outline-none min-h-[90px] border transition-all ${
                      isDark
                        ? "bg-white/5 border-transparent text-white focus:border-behance-blue shadow-inner"
                        : "bg-behance-grayBg border-transparent focus:border-behance-blue shadow-inner text-behance-black"
                    }`}
                    placeholder={t("dashboard.init.tagsPlaceholder", "branding, logo, typography, illustration")}
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    disabled={actionLoading}
                  />
                </div>
              )}

              {/* SMART TAG PRESETS CHIPS */}
              <div className="space-y-2 pt-1">
                <span className="text-[9px] font-black uppercase opacity-40 tracking-widest block">
                  Быстрые пресеты по направлениям:
                </span>
                <div className="space-y-2">
                  {TAG_PRESETS.map((group) => (
                    <div key={group.category} className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[9px] font-black opacity-50 mr-1 shrink-0">
                        {group.category}:
                      </span>
                      {group.tags.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handleAddPresetTag(t)}
                          className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-behance-blue hover:text-white dark:hover:bg-behance-blue text-[9px] font-bold uppercase tracking-tight transition-all cursor-pointer"
                        >
                          +{t}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-[10px] uppercase tracking-widest opacity-30 italic text-center py-2">
              {t("dashboard.init.customTagsLocked", "Кастомные теги доступны начиная с плана Daily Fresh 🔒")}
            </p>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={actionLoading || !urlInput.trim()}
            className="w-full bg-behance-blue text-white py-5 md:py-6 rounded-2xl md:rounded-3xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] shadow-xl shadow-blue-500/25 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {actionLoading ? t("dashboard.init.loading", "Подключение...") : t("dashboard.init.button", "Запустить проект")}
          </button>
        </form>
      </div>

      {/* DEMO PROJECT BUTTON */}
      <button
        onClick={onTryDemo}
        disabled={actionLoading}
        type="button"
        className="mt-6 md:mt-8 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity cursor-pointer inline-flex items-center gap-2"
      >
        <span>💡</span> {t("dashboard.emptyState.demoBtn", "Посмотреть на демо-проекте")}
      </button>
    </div>
  );
};
