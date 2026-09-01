import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NICHE_TAGS_DATA } from "../data/nicheTagsData";
import { useToast } from "../context/ToastContext";

export const NicheTagDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const isEn = i18n.language.startsWith("en");

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copyFormat, setCopyFormat] = useState<"comma" | "excel" | "hashtags">("comma");

  const niche = NICHE_TAGS_DATA.find((n) => n.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!niche) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <span className="text-4xl">🔍</span>
        <h1 className="text-2xl font-black">{isEn ? "Niche not found" : "Ниша не найдена"}</h1>
        <Link
          to="/tags"
          className="px-6 py-3 rounded-xl bg-behance-blue text-white font-bold text-xs uppercase"
        >
          {isEn ? "Back to Tags Catalog" : "Вернуться в каталог тегов"}
        </Link>
      </div>
    );
  }

  const title = isEn ? niche.titleEn : niche.titleRu;
  const desc = isEn ? niche.metaDescEn : niche.metaDescRu;
  const guide = isEn ? niche.guideEn : niche.guideRu;

  const handleCopyCombo = (tags: string[], idx: number) => {
    let formatted = "";
    if (copyFormat === "comma") {
      formatted = tags.join(", ");
    } else if (copyFormat === "excel") {
      formatted = tags.join("\n");
    } else {
      formatted = tags.map((t) => `#${t.replace(/\s+/g, "")}`).join(" ");
    }

    navigator.clipboard.writeText(formatted);
    setCopiedIndex(idx);
    showToast(isEn ? `Copied ${tags.length} tags in ${copyFormat} format! 🚀` : `Скопировано ${tags.length} тегов! 🚀`, "success");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col selection:bg-behance-blue selection:text-white">
      {/* SCHEMA.ORG JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            description: desc,
            author: {
              "@type": "Organization",
              name: "BeRanked",
              url: "https://beranked.domcraft.digital",
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://beranked.domcraft.digital/tags/${niche.slug}`,
            },
          }),
        }}
      />

      {/* HEADER NAV */}
      <header className="border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/tags" className="flex items-center gap-2 group">
            <span className="text-sm font-bold text-white/60 group-hover:text-white transition-colors">
              ← {isEn ? "All Niches" : "Все ниши"}
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={() => i18n.changeLanguage(isEn ? "ru" : "en")}
              type="button"
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-white/80 border border-white/10 transition-colors"
            >
              {isEn ? "🇷🇺 RU" : "🇬🇧 EN"}
            </button>
            <Link
              to="/"
              className="px-4 py-2 rounded-xl bg-behance-blue hover:bg-behance-darkBlue text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-blue-500/25"
            >
              {isEn ? "Check My Case 🚀" : "Проверить кейс 🚀"}
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* BREADCRUMBS */}
        <nav className="flex items-center gap-2 text-xs font-bold text-white/40">
          <Link to="/" className="hover:text-white transition-colors">BeRanked</Link>
          <span>/</span>
          <Link to="/tags" className="hover:text-white transition-colors">{isEn ? "Tags" : "Теги"}</Link>
          <span>/</span>
          <span className="text-white/80">{isEn ? niche.nameEn : niche.nameRu}</span>
        </nav>

        {/* HERO TITLE */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-xl">
            <span>{niche.icon}</span>
            <span className="text-xs font-black uppercase tracking-wider text-behance-blue">
              {isEn ? niche.nameEn : niche.nameRu}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            {title}
          </h1>

          <p className="text-sm sm:text-base text-white/70 leading-relaxed">
            {desc}
          </p>
        </div>

        {/* FORMAT SELECTOR & PRESET COMBOS */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>🔥</span>
                <span>{isEn ? "Ready-to-Copy 10-Tag Packs" : "Готовые наборы из 10 тегов"}</span>
              </h2>
              <p className="text-xs text-white/50">
                {isEn ? "Optimized for maximum organic reach and client inquiries" : "Оптимизированы под кураторские ленты и коммерческий поиск"}
              </p>
            </div>

            {/* FORMAT SELECTOR PILLS */}
            <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10 text-xs font-bold">
              <button
                onClick={() => setCopyFormat("comma")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  copyFormat === "comma" ? "bg-behance-blue text-white" : "text-white/60 hover:text-white"
                }`}
              >
                Comma (tag, tag)
              </button>
              <button
                onClick={() => setCopyFormat("hashtags")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  copyFormat === "hashtags" ? "bg-behance-blue text-white" : "text-white/60 hover:text-white"
                }`}
              >
                #Hashtags
              </button>
              <button
                onClick={() => setCopyFormat("excel")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  copyFormat === "excel" ? "bg-behance-blue text-white" : "text-white/60 hover:text-white"
                }`}
              >
                Excel (\n)
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {niche.combos.map((combo, idx) => {
              const isCopied = copiedIndex === idx;

              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-[#121216] border border-white/10 space-y-4 relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-black text-sm text-white">
                        {isEn ? combo.nameEn : combo.nameRu}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-behance-blue font-black text-[10px]">
                        {isEn ? combo.badgeEn : combo.badgeRu}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopyCombo(combo.tags, idx)}
                      type="button"
                      className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isCopied
                          ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                          : "bg-behance-blue hover:bg-behance-darkBlue text-white shadow-lg shadow-blue-500/20"
                      }`}
                    >
                      <span>{isCopied ? "✓" : "📋"}</span>
                      <span>{isCopied ? (isEn ? "Copied to Clipboard!" : "Скопировано в буфер!") : (isEn ? "Copy 10 Tags" : "Скопировать 10 тегов")}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {combo.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs font-mono text-white/90"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DETAILED KEYWORDS TABLE */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <span>📊</span>
            <span>{isEn ? "Curated Keywords Analysis" : "Детальный анализ ключевых тегов ниши"}</span>
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#121216]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-white/5 text-[11px] font-black uppercase tracking-wider text-white/50">
                <tr>
                  <th className="p-3.5"># {isEn ? "Tag" : "Тег"}</th>
                  <th className="p-3.5">{isEn ? "Volume" : "Потенциал"}</th>
                  <th className="p-3.5">{isEn ? "Competition" : "Конкуренция"}</th>
                  <th className="p-3.5">{isEn ? "Why it works" : "Особенности"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {niche.tags.map((item) => (
                  <tr key={item.tag} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5 font-bold font-mono text-behance-blue">
                      #{item.tag}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md font-black text-[10px] ${
                          item.volume === "GOLD"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : item.volume === "HIGH"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-white/10 text-white/70"
                        }`}
                      >
                        {item.volume === "GOLD" ? "💰 GOLD" : item.volume}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md font-black text-[10px] ${
                          item.difficulty === "EASY"
                            ? "bg-green-500/10 text-green-400"
                            : item.difficulty === "MEDIUM"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {item.difficulty}
                      </span>
                    </td>
                    <td className="p-3.5 text-white/70">
                      {isEn ? item.descriptionEn : item.descriptionRu}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* EXPERT RANKING GUIDE */}
        <div className="space-y-6 p-6 rounded-3xl bg-[#121216] border border-white/10">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <span>💡</span>
            <span>{isEn ? "How to Rank on Behance in this Niche" : "Как выводить кейсы в ТОП в этой категории"}</span>
          </h2>

          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            {guide.overview}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/20 space-y-2">
              <span className="text-xs font-black uppercase text-green-400 flex items-center gap-1.5">
                <span>✓</span>
                <span>{isEn ? "Recommended Strategies" : "Что делать"}</span>
              </span>
              <ul className="space-y-1.5 text-xs text-white/70 list-disc list-inside">
                {guide.algorithmTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-2">
              <span className="text-xs font-black uppercase text-red-400 flex items-center gap-1.5">
                <span>✕</span>
                <span>{isEn ? "Mistakes to Avoid" : "Чего избегать"}</span>
              </span>
              <ul className="space-y-1.5 text-xs text-white/70 list-disc list-inside">
                {guide.mistakesToAvoid.map((mistake, i) => (
                  <li key={i}>{mistake}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* CTA BANNER */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/30 text-center space-y-4">
          <h3 className="text-xl sm:text-2xl font-black text-white">
            {isEn ? "Ready to audit your Behance case?" : "Хотите проверить позиции вашего проекта?"}
          </h3>
          <p className="text-xs sm:text-sm text-white/70 max-w-xl mx-auto">
            {isEn
              ? "Use BeRanked to track your tags 24/7, discover which keywords bring traffic, and eliminate dead search terms."
              : "Используйте BeRanked для отслеживания позиций 24/7, находите точки роста и заменяйте неэффективные теги."}
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-behance-blue hover:bg-behance-darkBlue text-white text-xs font-black uppercase tracking-wider transition-all shadow-xl shadow-blue-500/30"
            >
              <span>🚀</span>
              <span>{isEn ? "Audit My Project for Free" : "Проверить проект бесплатно"}</span>
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
