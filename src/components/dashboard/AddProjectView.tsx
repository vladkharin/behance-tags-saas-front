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
      if (text && text.trim().length > 0) {
        setUrlInput(text.trim());
        showToast("Ссылка вставлена из буфера!", "success", undefined, 1500);
      } else {
        showToast("Буфер обмена пуст", "info");
      }
    } catch (err) {
      showToast("Не удалось прочитать буфер. Вставьте вручную (Ctrl+V)", "warning");
    }
  };

  const handlePresetClick = (tag: string) => {
    const currentTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (!currentTags.includes(tag)) {
      const nextTags = [...currentTags, tag].join(", ");
      setTagsInput(nextTags);
      if (!showTagsInput) setShowTagsInput(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || actionLoading) return;

    const customTagsList = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onImport(urlInput.trim(), customTagsList.length > 0 ? customTagsList : undefined);
  };

  return (
    <div className="max-w-2xl mx-auto py-6 md:py-12 space-y-6">
      {/* HEADER */}
      <div className="text-center space-y-3">
        <button
          onClick={onOpenMobileMenu}
          type="button"
          className="lg:hidden mx-auto mb-2 p-2 rounded-xl bg-zinc-100 dark:bg-white/5 text-xs font-bold flex items-center gap-2 cursor-pointer"
        >
          <span>☰</span>
          <span>Мои проекты</span>
        </button>

        <div className="w-12 h-12 rounded-2xl bg-behance-blue/10 text-behance-blue flex items-center justify-center text-xl mx-auto">
          🔗
        </div>

        <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight">
          Подключение кейса Behance
        </h1>
        <p className="text-xs md:text-sm opacity-60 max-w-md mx-auto leading-relaxed">
          Вставьте ссылку на кейс. Робот автоматически подтянет все теги, просмотры, оценки и начнет отслеживать позиции в выдаче.
        </p>

        {onOpenVideoTutorial && (
          <div className="pt-1">
            <button
              onClick={onOpenVideoTutorial}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-behance-blue/10 hover:bg-behance-blue hover:text-white text-behance-blue text-xs font-bold transition-all cursor-pointer"
            >
              <span>▶️</span>
              <span>Посмотреть 30-секундный видео-гид</span>
            </button>
          </div>
        )}
      </div>

      {/* FORM CARD */}
      <div
        className={`p-6 md:p-8 rounded-2xl border transition-all ${
          isDark ? "bg-[#141418] border-white/10" : "bg-white border-zinc-200 shadow-sm"
        }`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span>Ссылка на проект с Behance:</span>
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="text-[10px] uppercase font-bold text-behance-blue hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>📋</span>
                <span>Вставить из буфера</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="https://www.behance.net/gallery/19824219/My-Case"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className={`w-full rounded-xl px-4 py-3 text-xs font-medium outline-none border transition-all ${
                  isDark
                    ? "bg-black/50 border-white/10 text-white focus:border-behance-blue"
                    : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-behance-blue"
                } ${isValidBehanceUrl ? "border-green-500/50 pr-10" : ""}`}
              />
              {isValidBehanceUrl && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-xs font-bold">
                  ✓
                </span>
              )}
            </div>
          </div>

          {/* CUSTOM TAGS ACCORDION */}
          {hasCustomTags && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowTagsInput(!showTagsInput)}
                className="text-[11px] font-bold text-behance-blue hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>{showTagsInput ? "▼" : "▶"}</span>
                <span>Указать дополнительные кастомные теги</span>
              </button>

              {showTagsInput && (
                <input
                  type="text"
                  placeholder="figma, mobile app, dashboard, branding..."
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2.5 text-xs font-medium outline-none border transition-all ${
                    isDark
                      ? "bg-black/50 border-white/10 text-white focus:border-behance-blue"
                      : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-behance-blue"
                  }`}
                />
              )}
            </div>
          )}

          {/* CATEGORY TAG PRESETS */}
          <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 block">
              💡 Быстрые пресеты тегов по нишам:
            </span>
            <div className="space-y-2">
              {TAG_PRESETS.map((p) => (
                <div key={p.category} className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold opacity-60 w-24 shrink-0">
                    {p.category}:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {p.tags.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handlePresetClick(t)}
                        className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-white/5 hover:bg-behance-blue hover:text-white text-[10px] font-medium transition-colors cursor-pointer"
                      >
                        +{t}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={actionLoading || !urlInput.trim()}
            className="w-full py-3.5 rounded-xl bg-behance-blue hover:bg-behance-darkBlue text-white text-xs font-black uppercase tracking-wider transition-all disabled:opacity-40 shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            {actionLoading ? "🤖 Подключение и анализ..." : "🚀 Запустить анализ кейса"}
          </button>
        </form>

        {/* DEMO BUTTON */}
        <div className="mt-4 text-center">
          <button
            onClick={onTryDemo}
            type="button"
            className="text-xs font-bold text-zinc-500 hover:text-behance-blue transition-colors cursor-pointer"
          >
            Или посмотреть демо-кейс
          </button>
        </div>
      </div>
    </div>
  );
};
