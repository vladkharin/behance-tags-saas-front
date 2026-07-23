import React from "react";
import { useTheme } from "../context/ThemeContextInstance";
import { useTranslation } from "react-i18next";
import { Footer } from "../components/Footer";

export const RefundPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const isDark = theme === "dark";

  const sections = t("refund.sections", { returnObjects: true }) as any[];
  const steps = t("refund.steps", { returnObjects: true }) as any[];

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 ${isDark ? "bg-[#0a0a0a] text-white" : "bg-behance-grayBg text-behance-black"}`}
    >
      {/* HEADER */}
      <header className="py-8 px-16 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4 cursor-pointer" onClick={onBack}>
          <span className="text-xl font-black uppercase tracking-[0.3em] text-behance-blue">BeRanked</span>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={onBack} className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all">
            {t("refund.back")}
          </button>
          <button
            onClick={() => i18n.changeLanguage(i18n.language === "ru" ? "en" : "ru")}
            className="text-[10px] font-black w-10 h-10 rounded-full bg-white/5"
          >
            {i18n.language.toUpperCase()}
          </button>
          <button onClick={toggleTheme} className="p-3 rounded-full bg-white/5 text-xs">
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-8 md:px-16 py-12">
        <div
          className={`p-10 md:p-20 rounded-[3.5rem] border shadow-2xl transition-all ${isDark ? "bg-[#111111] border-white/5 shadow-black" : "bg-white border-behance-border"}`}
        >
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">{t("refund.title")}</h1>
          <p className="text-xs font-bold opacity-30 uppercase tracking-widest border-b border-current pb-6 mb-8">{t("refund.updated")}</p>

          <p className="text-lg font-bold opacity-80 mb-12 leading-relaxed">{t("refund.intro")}</p>

          <div className="space-y-16">
            {/* Обычные секции */}
            {sections.map((section, i) => (
              <section key={i} className="space-y-4">
                <h2 className="text-xl font-black uppercase text-behance-blue">{section.h}</h2>
                <p className="text-sm md:text-base leading-relaxed opacity-70">{section.p}</p>
              </section>
            ))}

            {/* Блок с алгоритмом (Шаги) */}
            <section className="space-y-8">
              <h2 className="text-xl font-black uppercase text-behance-blue">{t("refund.stepsTitle")}</h2>
              <p className="text-sm opacity-70">{t("refund.stepsDesc")}</p>

              <div className="grid gap-4">
                {steps.map((step, i) => (
                  <div
                    key={i}
                    className={`flex gap-6 p-8 rounded-[2rem] border transition-all ${isDark ? "bg-white/5 border-white/5" : "bg-behance-grayBg border-transparent"}`}
                  >
                    <span className="text-2xl font-black text-behance-blue opacity-30">{step.id}</span>
                    <p className="font-bold text-sm md:text-base uppercase tracking-tight self-center leading-snug">{step.text}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Финальные примечания */}
            <section className="pt-10 border-t border-current border-opacity-5 space-y-6">
              <p className="text-sm font-black uppercase tracking-tight opacity-80">{t("refund.footer.timeline")}</p>
              <div className="p-6 rounded-2xl bg-amber-500/10 border-l-4 border-amber-500 text-amber-600 text-[10px] font-black uppercase tracking-widest leading-loose">
                {t("refund.footer.warning")}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};
