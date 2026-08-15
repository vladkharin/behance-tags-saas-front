import React from "react";
import { useTheme } from "../context/ThemeContextInstance";
import { useTranslation } from "react-i18next";
import { Footer } from "../components/Footer";

interface HelpItem {
  q: string;
  a: string;
}

interface HelpCategory {
  title: string;
  items: HelpItem[];
}

export const HelpPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const isDark = theme === "dark";

  const categoriesData = t("help.categories", { returnObjects: true });
  const categories: HelpCategory[] = Array.isArray(categoriesData) ? categoriesData : [];

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        isDark ? "bg-[#0a0a0a] text-white" : "bg-behance-grayBg text-behance-black"
      }`}
    >
      {/* HEADER */}
      <header className="py-8 px-6 md:px-16 flex justify-between items-center max-w-7xl mx-auto w-full border-b border-behance-border dark:border-white/5">
        <div className="flex items-center gap-4 cursor-pointer" onClick={onBack}>
          <span className="text-xl font-black uppercase tracking-[0.3em] text-behance-blue transition-all hover:opacity-70">
            BeRanked
          </span>
          <span className="hidden md:inline text-[10px] font-bold opacity-30 uppercase tracking-widest italic">
            / Manual
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-all cursor-pointer"
          >
            {t("help.back")}
          </button>
          <button
            onClick={() => i18n.changeLanguage(i18n.language === "ru" ? "en" : "ru")}
            className="text-[10px] font-black w-9 h-9 rounded-full bg-white/5 shadow-sm border border-current border-opacity-5 flex items-center justify-center cursor-pointer"
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

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 md:px-16 py-8 md:py-16">
        <div className="mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-3 italic">
            {t("help.title")}
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">
            {t("help.updated")}
          </p>
        </div>

        <div className="space-y-12 md:space-y-16 mb-16">
          {categories.length > 0 ? (
            categories.map((cat, i) => (
              <section key={i} className="space-y-4">
                <h2 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-behance-blue opacity-85">
                  {cat.title}
                </h2>
                <div className="grid gap-4">
                  {Array.isArray(cat.items) &&
                    cat.items.map((item, j) => (
                      <div
                        key={j}
                        className={`p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border transition-all ${
                          isDark ? "bg-[#111111] border-white/5 shadow-inner" : "bg-white border-behance-border shadow-sm"
                        }`}
                      >
                        <h4 className="text-sm md:text-[15px] font-black mb-2.5 uppercase tracking-tight leading-tight">
                          {item.q}
                        </h4>
                        <p className="text-xs md:text-sm opacity-60 leading-relaxed font-medium">
                          {item.a}
                        </p>
                      </div>
                    ))}
                </div>
              </section>
            ))
          ) : (
            <p className="opacity-30 uppercase font-black text-xs tracking-widest">
              Loading manual...
            </p>
          )}
        </div>
      </main>

      <Footer onNavigate={() => onBack()} />
    </div>
  );
};
