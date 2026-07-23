import React from "react";
import { useTheme } from "../context/ThemeContextInstance";
import { useTranslation } from "react-i18next";
import { Footer } from "../components/Footer";

export const HelpPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const isDark = theme === "dark";

  const categories = t("help.categories", { returnObjects: true }) as any[];

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 ${isDark ? "bg-[#0a0a0a] text-white" : "bg-behance-grayBg text-behance-black"}`}
    >
      {/* HEADER */}
      <header className="py-8 px-16 flex justify-between items-center max-w-7xl mx-auto w-full border-b border-behance-border dark:border-white/5">
        <div className="flex items-center gap-4 cursor-pointer" onClick={onBack}>
          <span className="text-xl font-black uppercase tracking-[0.3em] text-behance-blue">BeRanked</span>
          <span className="hidden md:inline text-[10px] font-bold opacity-20 uppercase tracking-widest italic">/ Manual</span>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={onBack} className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all">
            {t("help.back")}
          </button>
          <button
            onClick={() => i18n.changeLanguage(i18n.language === "ru" ? "en" : "ru")}
            className="text-[10px] font-black w-10 h-10 rounded-full bg-white/5 shadow-sm border border-current border-opacity-5"
          >
            {i18n.language.toUpperCase()}
          </button>
          <button onClick={toggleTheme} className="p-3 rounded-full bg-white/5 text-xs">
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-8 md:px-16 py-16">
        <div className="mb-16">
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-4 italic">{t("help.title")}</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">{t("help.updated")}</p>
        </div>

        <div className="space-y-16 mb-20">
          {categories.map((cat, i) => (
            <section key={i} className="space-y-6">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-behance-blue opacity-80">{cat.title}</h2>
              <div className="grid gap-4">
                {cat.items.map((item: any, j: number) => (
                  <div
                    key={j}
                    className={`p-8 rounded-[2.5rem] border transition-all ${isDark ? "bg-[#111111] border-white/5" : "bg-white border-behance-border"}`}
                  >
                    <h4 className="text-[15px] font-black mb-3 uppercase tracking-tight leading-tight">{item.q}</h4>
                    <p className="text-sm opacity-60 leading-relaxed font-medium">{item.a}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer onNavigate={(view) => onBack()} />
    </div>
  );
};
