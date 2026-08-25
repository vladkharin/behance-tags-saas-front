import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContextInstance";

interface WelcomeModalProps {
  onClose: () => void;
  onOpenVideoTutorial?: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  onClose,
  onOpenVideoTutorial,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleClose = () => {
    localStorage.setItem("onboarding_complete", "true");
    onClose();
  };

  const handleWatchVideo = () => {
    handleClose();
    if (onOpenVideoTutorial) {
      onOpenVideoTutorial();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className={`max-w-2xl w-full p-8 md:p-12 rounded-[3rem] md:rounded-[3.5rem] border shadow-2xl transition-all ${
          isDark ? "bg-[#111111] border-white/5 shadow-black text-white" : "bg-white border-behance-border text-behance-black"
        }`}
      >
        <div className="flex justify-between items-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic text-behance-blue">
            {t("onboarding.title")}
          </h2>
          <span className="text-2xl">🚀</span>
        </div>

        <div className="grid gap-6 md:gap-8 mb-10 md:mb-12">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex gap-5 md:gap-6 items-start">
              <span className="text-2xl md:text-3xl font-black opacity-20 italic shrink-0 w-6">0{num}</span>
              <div className="space-y-1">
                <h4 className="font-black uppercase text-xs md:text-sm tracking-wider">{t(`onboarding.step${num}.h`)}</h4>
                <p className="text-xs md:text-sm opacity-60 leading-relaxed">{t(`onboarding.step${num}.p`)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleWatchVideo}
            type="button"
            className="flex-1 py-4 md:py-5 rounded-2xl bg-behance-blue/10 text-behance-blue font-black uppercase text-[10px] md:text-[11px] tracking-widest hover:bg-behance-blue hover:text-white transition-all cursor-pointer text-center"
          >
            {t("onboarding.videoGuide") || "▶️ Video Overview (1 min)"}
          </button>
          <button
            onClick={handleClose}
            type="button"
            className="flex-1 py-4 md:py-5 rounded-2xl bg-behance-blue text-white font-black uppercase text-[10px] md:text-[11px] tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer text-center"
          >
            {t("onboarding.button")}
          </button>
        </div>
      </div>
    </div>
  );
};
