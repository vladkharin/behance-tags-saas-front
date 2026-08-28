import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContextInstance";

interface WelcomeModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onOpenTutorial?: () => void;
  onOpenVideoTutorial?: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen = true,
  onClose,
  onOpenTutorial,
  onOpenVideoTutorial,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!isOpen) return null;

  const handleClose = () => {
    localStorage.setItem("onboarding_complete", "true");
    onClose();
  };

  const handleWatchVideo = () => {
    handleClose();
    if (onOpenTutorial) {
      onOpenTutorial();
    } else if (onOpenVideoTutorial) {
      onOpenVideoTutorial();
    }
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`max-w-2xl w-full p-6 sm:p-10 md:p-12 rounded-3xl md:rounded-[3rem] border shadow-2xl transition-all animate-in zoom-in-95 duration-200 relative ${
          isDark
            ? "bg-[#111111] border-white/10 shadow-black text-white"
            : "bg-white border-zinc-200 text-zinc-900 shadow-zinc-400/30"
        }`}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={handleClose}
          type="button"
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/20 flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
        >
          ✕
        </button>

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 sm:mb-8 pr-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-behance-blue">
            {t("onboarding.title")}
          </h2>
          <span className="text-2xl sm:text-3xl">🚀</span>
        </div>

        {/* STEPS */}
        <div className="grid gap-4 sm:gap-6 mb-8 sm:mb-10">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex gap-4 items-start">
              <span className="text-xl sm:text-2xl font-black opacity-30 italic shrink-0 w-6">
                0{num}
              </span>
              <div className="space-y-1">
                <h4 className="font-black uppercase text-xs sm:text-sm tracking-wider">
                  {t(`onboarding.step${num}.h`)}
                </h4>
                <p className="text-xs sm:text-sm opacity-60 leading-relaxed">
                  {t(`onboarding.step${num}.p`)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleWatchVideo}
            type="button"
            className="flex-1 py-3.5 sm:py-4 rounded-2xl bg-behance-blue/10 text-behance-blue font-black uppercase text-xs tracking-wider hover:bg-behance-blue hover:text-white transition-all cursor-pointer text-center"
          >
            {t("onboarding.videoGuide") || "▶️ Видео-обзор (1 мин)"}
          </button>
          <button
            onClick={handleClose}
            type="button"
            className="flex-1 py-3.5 sm:py-4 rounded-2xl bg-behance-blue hover:bg-behance-darkBlue text-white font-black uppercase text-xs tracking-wider shadow-lg shadow-blue-500/25 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer text-center"
          >
            {t("onboarding.button") || "Понятно, погнали!"}
          </button>
        </div>
      </div>
    </div>
  );
};
