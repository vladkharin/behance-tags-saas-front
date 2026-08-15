import React from "react";
import { useTheme } from "../context/ThemeContextInstance";
import { useTranslation } from "react-i18next";
import { Footer } from "../components/Footer";

interface LegalSection {
  h?: string;
  p?: string;
  p2?: string;
  p3?: string;
  italic?: string;
  list?: string[];
  steps?: string[];
  note?: string;
}

export const OfferPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const isDark = theme === "dark";

  const rawSections = t("offer.sections", { returnObjects: true });
  const sections: LegalSection[] = Array.isArray(rawSections) ? rawSections : [];

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
            {t("offer.back")}
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
            {t("offer.title")}
          </h1>
          <p className="text-xs font-bold opacity-30 uppercase tracking-widest border-b border-current pb-6 mb-8">
            {t("offer.updated")}
          </p>

          <div className="bg-behance-blue/5 border-l-4 border-behance-blue p-6 rounded-r-2xl mb-10">
            <p className="text-xs md:text-sm font-bold text-behance-blue uppercase leading-relaxed">
              {t("offer.warning")}
            </p>
          </div>

          <div className="space-y-10">
            {sections.map((section, i) => (
              <section key={i} className="space-y-3">
                {section.h && (
                  <h2 className="text-lg md:text-xl font-black uppercase text-behance-blue">
                    {section.h}
                  </h2>
                )}
                {section.p && <p className="text-sm md:text-base leading-relaxed opacity-70">{section.p}</p>}
                {section.p2 && <p className="text-sm md:text-base leading-relaxed opacity-70">{section.p2}</p>}
                {section.p3 && <p className="text-sm md:text-base leading-relaxed opacity-70">{section.p3}</p>}

                {section.italic && (
                  <p className="italic text-sm opacity-90 border-l-2 border-gray-300 dark:border-white/20 pl-4 py-1">
                    {section.italic}
                  </p>
                )}

                {section.list && (
                  <ul className="list-disc pl-6 space-y-2 opacity-70 text-sm md:text-base font-medium">
                    {section.list.map((item: string, j: number) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                )}

                {section.steps && (
                  <div className="grid gap-3 mt-4">
                    {section.steps.map((step: string, j: number) => (
                      <div
                        key={j}
                        className={`flex gap-4 p-4 md:p-5 rounded-2xl border ${
                          isDark ? "bg-white/5 border-white/5" : "bg-behance-grayBg border-transparent"
                        }`}
                      >
                        <span className="text-blue-500 font-black text-sm">0{j + 1}</span>
                        <p className="text-xs md:text-sm font-bold uppercase tracking-tight opacity-80">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {section.note && (
                  <p className="text-[10px] font-black uppercase opacity-30 pt-3">{section.note}</p>
                )}
              </section>
            ))}
          </div>

          {/* REQUISITES */}
          <div className="mt-16 pt-8 border-t border-behance-border dark:border-white/5 space-y-1.5">
            <h4 className="text-[11px] font-black uppercase tracking-widest opacity-40 mb-3">
              {t("offer.requisites.title")}
            </h4>
            <p className="text-sm font-bold uppercase">{t("offer.requisites.name")}</p>
            <p className="text-xs font-bold opacity-50">ИНН {t("offer.requisites.inn")}</p>
            <p className="text-xs font-bold text-behance-blue">{t("offer.requisites.support")}</p>
          </div>
        </div>
      </main>

      <Footer onNavigate={() => onBack()} />
    </div>
  );
};
