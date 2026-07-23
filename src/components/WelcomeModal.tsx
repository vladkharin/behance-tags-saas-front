import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContextInstance";

export const WelcomeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
      <div
        className={`max-w-2xl w-full p-12 rounded-[3.5rem] border shadow-2xl transition-all ${isDark ? "bg-[#111111] border-white/5" : "bg-white border-behance-border"}`}
      >
        <h2 className="text-4xl font-black uppercase tracking-tighter mb-10 italic text-behance-blue">{t("onboarding.title")}</h2>

        <div className="grid gap-8 mb-12">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex gap-6">
              <span className="text-4xl font-black opacity-10 italic">{num}</span>
              <div className="space-y-1">
                <h4 className="font-black uppercase text-sm tracking-widest">{t(`onboarding.step${num}.h`)}</h4>
                <p className="text-sm opacity-50 leading-relaxed">{t(`onboarding.step${num}.p`)}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="w-full py-6 rounded-2xl bg-behance-blue text-white font-black uppercase text-[10px] tracking-[0.3em] shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          {t("onboarding.button")}
        </button>
      </div>
    </div>
  );
};
