import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { parseTagsInput } from "../../utils/tagParser";
import { useToast } from "../../context/ToastContext";

interface HybridTagInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isDark?: boolean;
}

export const HybridTagInput: React.FC<HybridTagInputProps> = ({
  value,
  onChange,
  placeholder,
  isDark = true,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [showFormatsHelp, setShowFormatsHelp] = useState(false);

  const parsedTags = parseTagsInput(value);

  const handlePasteFromClipboard = async () => {
    try {
      if (!navigator.clipboard) {
        showToast(t("modals.addProject.clipboardWarning"), "warning");
        return;
      }
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        const newText = value.trim() ? `${value.trim()}\n${text.trim()}` : text.trim();
        onChange(newText);
        const tags = parseTagsInput(newText);
        showToast(
          t("modals.addProject.hybridRecognized", { count: tags.length }),
          "success",
          undefined,
          1500
        );
      }
    } catch (err) {
      showToast(t("modals.addProject.clipboardError"), "warning");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const remaining = parsedTags.filter((t) => t !== tagToRemove);
    onChange(remaining.join("\n"));
  };

  const handleClearAll = () => {
    onChange("");
  };

  return (
    <div className="space-y-2.5 animate-in fade-in">
      {/* HEADER & QUICK ACTIONS */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold">
          {parsedTags.length > 0 ? (
            <span className="px-2.5 py-0.5 rounded-full bg-green-500/15 text-green-500 text-[10px] font-black uppercase font-mono tracking-wider border border-green-500/30">
              {t("modals.addProject.hybridRecognized", { count: parsedTags.length })}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setShowFormatsHelp(!showFormatsHelp)}
              className="text-[11px] text-behance-blue hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>{t("modals.addProject.formatsHelpBtn")}</span>
              <span className="text-[10px] opacity-60">{showFormatsHelp ? "▲" : "▼"}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePasteFromClipboard}
            className="text-[10px] uppercase font-bold text-behance-blue hover:underline cursor-pointer flex items-center gap-1 shrink-0"
          >
            <span>{t("modals.addProject.hybridPasteBtn")}</span>
          </button>

          {value.trim() && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[10px] uppercase font-bold text-red-400 hover:underline cursor-pointer shrink-0"
            >
              {t("modals.addProject.hybridClearAll")}
            </button>
          )}
        </div>
      </div>

      {/* EXPANDABLE INFORMATIVE INSTRUCTIONS / FORMATS HELPER */}
      {showFormatsHelp && (
        <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 text-left space-y-2 text-xs animate-in fade-in">
          <div className="font-bold text-[11px] text-behance-blue flex items-center justify-between">
            <span>{t("modals.addProject.formatsHelpTitle")}</span>
            <button
              type="button"
              onClick={() => setShowFormatsHelp(false)}
              className="hover:opacity-75 cursor-pointer text-zinc-400 text-sm font-bold"
            >
              ✕
            </button>
          </div>
          <ul className="space-y-1 text-[11px] opacity-80 leading-relaxed list-disc list-inside">
            <li>{t("modals.addProject.formatExcel")}</li>
            <li>{t("modals.addProject.formatComma")}</li>
            <li>{t("modals.addProject.formatHashtags")}</li>
            <li>{t("modals.addProject.formatNumbers")}</li>
          </ul>
        </div>
      )}

      {/* MULTI-LINE TEXTAREA FOR EXCEL & COMMA PASTES */}
      <textarea
        rows={3}
        placeholder={placeholder || t("modals.addProject.hybridTagPlaceholder")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl px-4 py-3 text-xs font-medium outline-none border transition-all resize-y scrollbar-thin ${
          isDark
            ? "bg-black/50 border-white/10 text-white focus:border-behance-blue placeholder-zinc-500"
            : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-behance-blue placeholder-zinc-400"
        }`}
      />

      {/* PARSED TAG CHIPS GALLERY */}
      {parsedTags.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
            {parsedTags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  isDark
                    ? "bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                    : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                }`}
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-red-400 opacity-60 hover:opacity-100 cursor-pointer font-bold ml-0.5 text-[11px]"
                  title={t("dashboard.matrix.deleteTagTooltip", { tag })}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
