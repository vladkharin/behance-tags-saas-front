import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContextInstance";

interface EmptyProjectsViewProps {
  onAddProject: (url: string) => void;
  onLoadDemo: () => void;
  isAdding?: boolean;
}

export const EmptyProjectsView: React.FC<EmptyProjectsViewProps> = ({
  onAddProject,
  onLoadDemo,
  isAdding = false,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [urlInput, setUrlInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || isAdding) return;
    onAddProject(urlInput.trim());
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-8 animate-in fade-in">
      {/* HERO BADGE */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-behance-blue text-xs font-bold uppercase tracking-wider">
        <span>🚀</span>
        <span>{t("dashboard.emptyView.heroBadge")}</span>
      </div>

      {/* TITLE & DESCRIPTION */}
      <div className="space-y-3">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-behance-black dark:text-white">
          {t("dashboard.emptyView.title")}
        </h1>
        <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed font-medium">
          {t("dashboard.emptyView.subtitle")}
        </p>
      </div>

      {/* QUICK ADD BOX */}
      <div
        className={`p-6 md:p-8 rounded-3xl border transition-all text-left shadow-xl ${
          isDark ? "bg-[#141419] border-white/10" : "bg-white border-zinc-200"
        }`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
            {t("dashboard.emptyView.inputLabel")}
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              placeholder={t("dashboard.emptyView.inputPlaceholder")}
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={isAdding}
              className={`flex-1 px-4 py-3.5 rounded-2xl text-sm font-medium outline-none border transition-all ${
                isDark
                  ? "bg-white/5 border-white/10 text-white placeholder-zinc-600 focus:border-behance-blue"
                  : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-behance-blue"
              }`}
              required
            />
            <button
              type="submit"
              disabled={isAdding || !urlInput.trim()}
              className="px-6 py-3.5 bg-behance-blue hover:bg-behance-darkBlue text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isAdding ? t("dashboard.emptyView.submittingBtn") : t("dashboard.emptyView.submitBtn")}
            </button>
          </div>
        </form>

        {/* OR DEMO BUTTON */}
        <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            {t("dashboard.emptyView.noUrlText")}
          </div>
          <button
            onClick={onLoadDemo}
            type="button"
            className="text-xs font-bold text-behance-blue hover:underline cursor-pointer shrink-0"
          >
            {t("dashboard.emptyView.tryDemoBtn")}
          </button>
        </div>
      </div>

      {/* 3 STEPS PREVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-4">
        <div
          className={`p-5 rounded-2xl border ${
            isDark ? "bg-white/5 border-white/5" : "bg-zinc-50 border-zinc-200"
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-behance-blue flex items-center justify-center font-black text-sm mb-3">
            1
          </div>
          <h4 className="text-xs font-black uppercase text-behance-black dark:text-white mb-1">
            {t("dashboard.emptyView.step1Title")}
          </h4>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            {t("dashboard.emptyView.step1Desc")}
          </p>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            isDark ? "bg-white/5 border-white/5" : "bg-zinc-50 border-zinc-200"
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center font-black text-sm mb-3">
            2
          </div>
          <h4 className="text-xs font-black uppercase text-behance-black dark:text-white mb-1">
            {t("dashboard.emptyView.step2Title")}
          </h4>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            {t("dashboard.emptyView.step2Desc")}
          </p>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            isDark ? "bg-white/5 border-white/5" : "bg-zinc-50 border-zinc-200"
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-sm mb-3">
            3
          </div>
          <h4 className="text-xs font-black uppercase text-behance-black dark:text-white mb-1">
            {t("dashboard.emptyView.step3Title")}
          </h4>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            {t("dashboard.emptyView.step3Desc")}
          </p>
        </div>
      </div>
    </div>
  );
};
