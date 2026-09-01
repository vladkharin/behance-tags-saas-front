import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NICHE_TAGS_DATA, type NicheCategory } from "../data/nicheTagsData";
import { useToast } from "../context/ToastContext";

export const TagsCatalogPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const isEn = i18n.language.startsWith("en");

  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCombo, setCopiedCombo] = useState<string | null>(null);

  const filteredNiches = useMemo(() => {
    if (!searchQuery.trim()) return NICHE_TAGS_DATA;
    const q = searchQuery.toLowerCase();
    return NICHE_TAGS_DATA.filter((niche) => {
      const name = isEn ? niche.nameEn.toLowerCase() : niche.nameRu.toLowerCase();
      const matchTag = niche.tags.some((t) => t.tag.toLowerCase().includes(q));
      return name.includes(q) || matchTag;
    });
  }, [searchQuery, isEn]);

  const handleCopyTags = (e: React.MouseEvent, tags: string[], comboId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const text = tags.join(", ");
    navigator.clipboard.writeText(text);
    setCopiedCombo(comboId);
    showToast(isEn ? `Copied ${tags.length} tags to clipboard! 📋` : `Скопировано ${tags.length} тегов в буфер! 📋`, "success");
    setTimeout(() => setCopiedCombo(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col selection:bg-behance-blue selection:text-white">
      {/* HEADER NAV */}
      <header className="border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              B
            </div>
            <span className="font-black text-lg tracking-tight text-white">
              BERANKED <span className="text-behance-blue text-xs ml-1 font-mono uppercase">TAGS</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/guides"
              className="text-xs font-bold text-white/70 hover:text-white transition-colors"
            >
              {isEn ? "📚 Guides" : "📚 Гайды"}
            </Link>
            <button
              onClick={() => i18n.changeLanguage(isEn ? "ru" : "en")}
              type="button"
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-white/80 border border-white/10 transition-colors"
            >
              {isEn ? "🇷🇺 RU" : "🇬🇧 EN"}
            </button>
            <Link
              to="/"
              className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-behance-blue hover:bg-behance-darkBlue text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-blue-500/25"
            >
              {isEn ? "Check My Case 🚀" : "Проверить кейс 🚀"}
            </Link>
          </div>
        </div>
      </header>

      {/* HERO BANNER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-12 space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-behance-blue text-xs font-black uppercase tracking-wider">
            <span>🏷️</span>
            <span>{isEn ? "Verified Behance Tag Directory 2026" : "Каталог проверенных тегов Behance 2026"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            {isEn ? "Best Behance Tags by Design Niche" : "ТОП теги для Behance по нишам дизайна"}
          </h1>

          <p className="text-sm sm:text-base text-white/60 leading-relaxed">
            {isEn
              ? "Discover handpicked, high-ranking tag combinations for UI/UX, 3D, Branding, Web Design, and Packaging. Copy ready-made 10-tag packs in 1 click."
              : "Готовые проверенные наборы тегов для UI/UX, 3D, Брендинга, Веб-дизайна и Упаковки. Копируйте готовые паки из 10 тегов в один клик и поднимайте кейсы в ТОП."}
          </p>

          {/* SEARCH BAR */}
          <div className="pt-2 max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEn ? "Search by niche or tag (e.g. figma, 3d, mobile)..." : "Поиск по нише или тегу (например: figma, 3d, логотипы)..."}
                className="w-full px-5 py-4 pl-12 rounded-2xl bg-[#121216] border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:border-behance-blue focus:ring-1 focus:ring-behance-blue shadow-xl transition-all"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-white/40">
                🔍
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-white/40 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* NICHES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNiches.map((niche) => {
            const defaultCombo = niche.combos[0];
            const comboId = `${niche.slug}-default`;
            const isCopied = copiedCombo === comboId;

            return (
              <div
                key={niche.slug}
                className="p-6 rounded-3xl bg-[#121216] border border-white/5 hover:border-blue-500/30 transition-all group flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        {niche.icon}
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-white group-hover:text-behance-blue transition-colors">
                          {isEn ? niche.nameEn : niche.nameRu}
                        </h2>
                        <span className="text-[11px] font-bold text-white/40">
                          {niche.tags.length} {isEn ? "curated keywords" : "проверенных тегов"}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/tags/${niche.slug}`}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-bold border border-white/10 transition-all flex items-center gap-1 shrink-0"
                    >
                      <span>{isEn ? "Full Guide" : "Разбор"}</span>
                      <span>→</span>
                    </Link>
                  </div>

                  <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                    {isEn ? niche.metaDescEn : niche.metaDescRu}
                  </p>

                  {/* PRESET COMBO PILLS */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-black uppercase tracking-wider text-white/40">
                        {isEn ? defaultCombo.nameEn : defaultCombo.nameRu}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-behance-blue font-black text-[10px]">
                        {isEn ? defaultCombo.badgeEn : defaultCombo.badgeRu}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {defaultCombo.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[11px] font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* BOTTOM ACTIONS */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={(e) => handleCopyTags(e, defaultCombo.tags, comboId)}
                    type="button"
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isCopied
                        ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                        : "bg-behance-blue hover:bg-behance-darkBlue text-white shadow-lg shadow-blue-500/20"
                    }`}
                  >
                    <span>{isCopied ? "✓" : "📋"}</span>
                    <span>{isCopied ? (isEn ? "Copied!" : "Скопировано!") : (isEn ? "Copy 10 Tags" : "Скопировать 10 тегов")}</span>
                  </button>

                  <Link
                    to={`/tags/${niche.slug}`}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition-colors text-center"
                  >
                    {isEn ? "Explore" : "Подробнее"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA BANNER: TEST LIVE CASE IN BERANKED */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-purple-900/30 border border-blue-500/30 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-3xl">🚀</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {isEn ? "Wondering where your case ranks right now?" : "Хотите узнать, на каком месте ваш кейс прямо сейчас?"}
            </h2>
            <p className="text-sm text-white/70">
              {isEn
                ? "Paste your Behance project URL into BeRanked and audit all 10 keywords in live search in 10 seconds."
                : "Вставьте ссылку на свой проект в BeRanked и проверьте реальные позиции всех 10 тегов в поиске Behance за 10 секунд."}
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-behance-blue hover:bg-behance-darkBlue text-white text-sm font-black uppercase tracking-wider transition-all shadow-xl shadow-blue-500/30 hover:scale-105"
            >
              <span>🎯</span>
              <span>{isEn ? "Analyze My Behance Project (Free)" : "Проверить мой кейс бесплатно"}</span>
            </Link>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-white/40">
        <p>© 2026 BeRanked. {isEn ? "All rights reserved." : "Все права защищены."}</p>
      </footer>
    </div>
  );
};
