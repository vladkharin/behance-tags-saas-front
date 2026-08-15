import React from "react";
import { useTheme } from "../context/ThemeContextInstance";
import { useTranslation } from "react-i18next";
import { Footer } from "../components/Footer";

interface RefundSection {
  h: string;
  p: string;
}

interface RefundStep {
  id: string | number;
  text: string;
}

export const RefundPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const isDark = theme === "dark";

  const rawSections = t("refund.sections", { returnObjects: true });
  const rawSteps = t("refund.steps", { returnObjects: true });

  const sections: RefundSection[] = Array.isArray(rawSections) ? rawSections : [];
  const steps: RefundStep[] = Array.isArray(rawSteps) ? rawSteps : [];

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        isDark ? "bg-[#0a0a0a] text-white" : "bg-behance-grayBg text-behance-black"
      }`}
    >
      {/* HEADER */}
      <header className="py-8 px-6 md:px-16 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4 cursor-pointer" onClick={onBack}>
          <span className="text-xl font-black uppercase tracking-[0.3em] text-behance-blue">
            BeRanked
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-all cursor-pointer"
          >
            {t("refund.back")}
          </button>
          <button
            onClick={() => i18n.changeLanguage(i18n.language === "ru" ? "en" : "ru")}
            className="text-[10px] font-black w-9 h-9 rounded-full bg-white/5 flex items-center justify-center cursor-pointer"
          >
            {i18n.language.toUpperCase().substring(0, 2)}
          </button>
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full bg-white/5 text-xs flex items-center justify-center cursor-pointer"
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 md:px-16 py-8 md:py-12">
        <div
          className={`p-8 md:p-16 rounded-[2.5rem] md:rounded-[3.5rem] border shadow-2xl transition-all ${
            isDark ? "bg-[#111111] border-white/5 shadow-black" : "bg-white border-behance-border"
          }`}
        >
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase mb-2">
            {t("refund.title")}
          </h1>
          <p className="text-xs font-bold opacity-30 uppercase tracking-widest border-b border-current pb-6 mb-8">
            {t("refund.updated")}
          </p>

          <p className="text-base md:text-lg font-bold opacity-80 mb-10 leading-relaxed">
            {t("refund.intro")}
          </p>

          <div className="space-y-12">
            {/* SECTIONS */}
            {sections.map((section, i) => (
              <section key={i} className="space-y-3">
                <h2 className="text-lg md:text-xl font-black uppercase text-behance-blue">
                  {section.h}
                </h2>
                <p className="text-sm md:text-base leading-relaxed opacity-70">
                  {section.p}
                </p>
              </section>
            ))}

            {/* STEPS */}
            <section className="space-y-6">
              <h2 className="text-lg md:text-xl font-black uppercase text-behance-blue">
                {t("refund.stepsTitle")}
              </h2>
              <p className="text-sm opacity-70">{t("refund.stepsDesc")}</p>

              <div className="grid gap-3">
                {steps.map((step, i) => (
                  <div
                    key={i}
                    className={`flex gap-5 p-6 rounded-2xl border transition-all ${
                      isDark ? "bg-white/5 border-white/5" : "bg-behance-grayBg border-transparent"
                    }`}
                  >
                    <span className="text-2xl font-black text-behance-blue opacity-30 shrink-0">
                      {step.id}
                    </span>
                    <p className="font-bold text-sm uppercase tracking-tight self-center leading-snug">
                      {step.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* TIMELINE & WARNING */}
            <section className="pt-8 border-t border-current border-opacity-5 space-y-5">
              <p className="text-xs md:text-sm font-black uppercase tracking-tight opacity-80">
                {t("refund.footer.timeline")}
              </p>
              <div className="p-5 rounded-2xl bg-amber-500/10 border-l-4 border-amber-500 text-amber-600 text-[10px] md:text-xs font-black uppercase tracking-widest leading-relaxed">
                {t("refund.footer.warning")}
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer onNavigate={() => onBack()} />
    </div>
  );
};
