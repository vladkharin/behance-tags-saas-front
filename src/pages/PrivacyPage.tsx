import React from "react";
import { useTheme } from "../context/ThemeContextInstance";
import { useTranslation } from "react-i18next";

export const PrivacyPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const isDark = theme === "dark";

  const sections = t("privacy.sections", { returnObjects: true }) as any[];

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
            {t("privacy.back")}
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
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">{t("privacy.title")}</h1>
          <p className="text-xs font-bold opacity-30 uppercase tracking-widest border-b border-current pb-6 mb-12">
            {t("privacy.updated")}
          </p>

          <div className="space-y-12">
            {sections.map((section, i) => (
              <section key={i} className="space-y-4">
                {section.h && <h2 className="text-xl font-black uppercase text-behance-blue">{section.h}</h2>}
                {section.p && <p className="text-sm md:text-base leading-relaxed opacity-70">{section.p}</p>}

                {section.list && (
                  <ul className="list-disc pl-6 space-y-3 opacity-70 text-sm md:text-base font-medium">
                    {section.list.map((item: string, j: number) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                )}

                {section.important && (
                  <div className="p-6 rounded-2xl bg-amber-500/10 border-l-4 border-amber-500 text-amber-600 text-sm font-bold uppercase tracking-tight leading-relaxed">
                    {section.important}
                  </div>
                )}

                {section.highlight && (
                  <div className="p-6 rounded-2xl bg-behance-blue/10 border-l-4 border-behance-blue text-behance-blue text-sm font-bold uppercase tracking-tight leading-relaxed">
                    {section.highlight}
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* REQUISITES */}
          <div className="mt-20 pt-10 border-t border-behance-border dark:border-white/5 space-y-2">
            <h4 className="text-[11px] font-black uppercase tracking-widest opacity-40 mb-4">{t("privacy.requisites.title")}</h4>
            <p className="text-sm font-bold uppercase">{t("privacy.requisites.name")}</p>
            <p className="text-xs font-bold opacity-50">ИНН {t("privacy.requisites.inn")}</p>
            <p className="text-xs font-bold text-behance-blue">{t("privacy.requisites.support")}</p>
          </div>
        </div>
      </main>
    </div>
  );
};
