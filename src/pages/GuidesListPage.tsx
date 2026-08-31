import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContextInstance";
import { GUIDES_ARTICLES, type GuideArticle } from "../data/guidesData";

export const GuidesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { i18n } = useTranslation();
  const isDark = theme === "dark";

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = [
    { id: "all", label: "Все статьи" },
    { id: "tags", label: "🏷️ Теги и семантика" },
    { id: "promotion", label: "🚀 Продвижение" },
    { id: "algorithms", label: "⚙️ Алгоритмы" },
    { id: "mistakes", label: "⚠️ Ошибки" },
    { id: "sales", label: "💼 Продажи и клиенты" },
  ];

  const filteredArticles = useMemo(() => {
    return GUIDES_ARTICLES.filter((article) => {
      const matchesCategory =
        selectedCategory === "all" || article.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.keywords.some((k) =>
          k.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className={`min-h-screen transition-all ${isDark ? "bg-[#0a0a0c] text-white" : "bg-[#f8f9fc] text-zinc-900"}`}>
      {/* 1. STICKY HEADER */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-all ${
        isDark ? "bg-[#0a0a0c]/85 border-white/10" : "bg-white/85 border-zinc-200"
      }`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-behance-blue text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform">
              B
            </div>
            <div>
              <span className="text-sm font-black tracking-tight bg-gradient-to-r from-behance-blue to-indigo-500 bg-clip-text text-transparent uppercase">
                BeRanked
              </span>
              <span className="text-[9px] opacity-40 font-mono block">KNOWLEDGE BASE</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              type="button"
              className="text-xs font-bold opacity-70 hover:opacity-100 transition-opacity hidden sm:block"
            >
              Главная
            </button>
            <button
              onClick={() => navigate("/plans")}
              type="button"
              className="text-xs font-bold opacity-70 hover:opacity-100 transition-opacity hidden sm:block"
            >
              Тарифы
            </button>

            <button
              onClick={toggleTheme}
              type="button"
              className="p-2 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-xs transition-colors cursor-pointer"
            >
              {isDark ? "☀️" : "🌙"}
            </button>

            <button
              onClick={() => navigate("/auth")}
              type="button"
              className="px-4 py-2 rounded-xl bg-behance-blue hover:bg-behance-darkBlue text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              Начать бесплатно
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO HEADER */}
      <section className="py-12 md:py-16 px-4 text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-behance-blue text-xs font-black uppercase tracking-wider">
          <span>📚</span>
          <span>База знаний и SEO-гайды по Behance</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
          Как выводить кейсы в ТОП и получать клиентов
        </h1>

        <p className="text-sm md:text-base opacity-70 max-w-2xl mx-auto leading-relaxed">
          Практические статьи, алгоритмы ранжирования, подбор тегов и разборы реальных ошибок дизайнеров без воды и нейрослопа.
        </p>

        {/* SEARCH BAR */}
        <div className="max-w-xl mx-auto pt-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Поиск по статьям (например: теги, алгоритмы, ошибки)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-5 py-3.5 pl-11 rounded-2xl text-xs sm:text-sm font-medium outline-none border transition-all shadow-sm ${
                isDark
                  ? "bg-white/5 border-white/10 text-white placeholder-zinc-500 focus:border-behance-blue"
                  : "bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-behance-blue"
              }`}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm opacity-40">
              🔍
            </span>
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              type="button"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-behance-blue text-white shadow-md shadow-blue-500/20"
                  : isDark
                    ? "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* 3. ARTICLES GRID */}
      <main className="max-w-6xl mx-auto px-4 pb-20">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16 opacity-60 text-sm">
            По вашему запросу статей не найдено. Попробуйте изменить ключевые слова.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <article
                key={article.slug}
                onClick={() => navigate(`/guides/${article.slug}`)}
                className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between group hover:-translate-y-1 shadow-sm ${
                  isDark
                    ? "bg-[#121216] border-white/10 hover:border-behance-blue/50 hover:shadow-blue-500/5"
                    : "bg-white border-zinc-200 hover:border-behance-blue/50 hover:shadow-xl"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-behance-blue text-[10px] font-black uppercase tracking-wider">
                      {article.categoryLabel}
                    </span>
                    <span className="opacity-50 text-[11px] font-mono">
                      ⏱ {article.readTime}
                    </span>
                  </div>

                  <h2 className="text-base sm:text-lg font-black leading-snug group-hover:text-behance-blue transition-colors">
                    {article.title}
                  </h2>

                  <p className="text-xs opacity-70 leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{article.author.avatar}</span>
                    <span className="text-xs font-bold opacity-80">{article.author.name}</span>
                  </div>

                  <span className="text-xs font-bold text-behance-blue group-hover:translate-x-1 transition-transform">
                    Читать ➔
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* BOTTOM CTA CARD */}
        <div className={`mt-16 p-8 md:p-12 rounded-3xl border text-center space-y-4 max-w-4xl mx-auto shadow-2xl ${
          isDark
            ? "bg-gradient-to-b from-blue-900/20 to-black/40 border-blue-500/30"
            : "bg-gradient-to-b from-blue-50 to-white border-blue-200"
        }`}>
          <span className="text-3xl">🚀</span>
          <h3 className="text-xl md:text-2xl font-black">
            Хотите проверить позиции своих тегов прямо сейчас?
          </h3>
          <p className="text-xs sm:text-sm opacity-70 max-w-xl mx-auto">
            Подключите свой кейс Behance за 1 минуту. Сервис покажет реальные места в выдаче и предложит работающие теги.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate("/auth")}
              type="button"
              className="px-6 py-3.5 rounded-2xl bg-behance-blue hover:bg-behance-darkBlue text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-blue-500/25 cursor-pointer"
            >
              Попробовать бесплатно ➔
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
