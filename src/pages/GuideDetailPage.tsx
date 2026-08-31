import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContextInstance";
import { useToast } from "../context/ToastContext";
import { GUIDES_ARTICLES, getLocalizedArticle } from "../data/guidesData";

export const GuideDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const isDark = theme === "dark";

  const toggleLanguage = () => {
    const nextLang = i18n.language === "ru" ? "en" : "ru";
    i18n.changeLanguage(nextLang);
  };

  const rawArticle = useMemo(() => {
    return GUIDES_ARTICLES.find((a) => a.slug === slug);
  }, [slug]);

  const article = useMemo(() => {
    if (!rawArticle) return null;
    return getLocalizedArticle(rawArticle, i18n.language);
  }, [rawArticle, i18n.language]);

  // Related articles
  const relatedArticles = useMemo(() => {
    if (!article) return [];
    return GUIDES_ARTICLES.filter((a) => a.slug !== article.slug)
      .slice(0, 3)
      .map((a) => getLocalizedArticle(a, i18n.language));
  }, [article, i18n.language]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!article) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${
        isDark ? "bg-[#0a0a0c] text-white" : "bg-[#f8f9fc] text-zinc-900"
      }`}>
        <h1 className="text-3xl font-black mb-2">{t("guides.notFoundTitle")}</h1>
        <p className="text-sm opacity-60 mb-6">{t("guides.notFoundDesc")}</p>
        <button
          onClick={() => navigate("/guides")}
          className="px-5 py-2.5 rounded-xl bg-behance-blue text-white text-xs font-bold uppercase cursor-pointer"
        >
          {t("guides.allGuides")}
        </button>
      </div>
    );
  }

  // Schema.org Article JSON-LD
  const schemaArticleJson = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt,
    "image": "https://beranked.domcraft.digital/og-image.png",
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt,
    "author": {
      "@type": "Person",
      "name": article.author.name,
      "jobTitle": article.author.role,
    },
    "publisher": {
      "@type": "Organization",
      "name": "BeRanked",
      "logo": {
        "@type": "ImageObject",
        "url": "https://beranked.domcraft.digital/favicon.svg",
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://beranked.domcraft.digital/guides/${article.slug}`,
    },
    "keywords": article.keywords.join(", "),
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast(t("guides.copiedToast"), "success");
  };

  return (
    <div className={`min-h-screen transition-all ${isDark ? "bg-[#0a0a0c] text-white" : "bg-[#f8f9fc] text-zinc-900"}`}>
      {/* SCHEMA.ORG INJECTION */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaArticleJson) }}
      />

      {/* 1. STICKY NAV */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-all ${
        isDark ? "bg-[#0a0a0c]/85 border-white/10" : "bg-white/85 border-zinc-200"
      }`}>
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div
            onClick={() => navigate("/guides")}
            className="flex items-center gap-2 cursor-pointer group text-xs font-bold opacity-75 hover:opacity-100"
          >
            <span>{t("guides.allGuides")}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              type="button"
              className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-xs font-bold transition-colors cursor-pointer"
            >
              {t("guides.shareBtn")}
            </button>

            {/* LANGUAGE SWITCHER */}
            <button
              onClick={toggleLanguage}
              type="button"
              className="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-xs font-black uppercase transition-all cursor-pointer"
              title="Switch Language"
            >
              {i18n.language === "ru" ? "RU" : "EN"}
            </button>

            {/* THEME TOGGLE */}
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
              className="px-4 py-2 rounded-xl bg-behance-blue hover:bg-behance-darkBlue text-white text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer"
            >
              {t("landing.nav.login")}
            </button>
          </div>
        </div>
      </header>

      {/* 2. ARTICLE HERO & BREADCRUMBS */}
      <div className="max-w-3xl mx-auto px-4 pt-10 pb-6 space-y-4">
        {/* BREADCRUMBS */}
        <nav className="flex items-center gap-2 text-[11px] opacity-50 font-bold uppercase tracking-wider">
          <span onClick={() => navigate("/")} className="hover:underline cursor-pointer">{t("guides.breadcrumbsHome")}</span>
          <span>/</span>
          <span onClick={() => navigate("/guides")} className="hover:underline cursor-pointer">{t("guides.breadcrumbsGuides")}</span>
          <span>/</span>
          <span className="text-behance-blue truncate max-w-[200px]">{article.categoryLabel}</span>
        </nav>

        <span className="inline-block px-3 py-1 rounded-lg bg-blue-500/10 text-behance-blue text-xs font-black uppercase tracking-wider">
          {article.categoryLabel}
        </span>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
          {article.title}
        </h1>

        <p className="text-sm sm:text-base opacity-70 leading-relaxed font-medium">
          {article.subtitle}
        </p>

        {/* META BAR */}
        <div className="pt-4 pb-6 border-b border-zinc-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{article.author.avatar}</span>
            <div>
              <div className="font-bold">{article.author.name}</div>
              <div className="opacity-50 text-[11px]">{article.author.role}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 opacity-60 font-mono text-[11px]">
            <span>📅 {article.publishedAt}</span>
            <span>⏱ {article.readTime}</span>
          </div>
        </div>
      </div>

      {/* 3. TABLE OF CONTENTS */}
      {article.tableOfContents && article.tableOfContents.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 mb-8">
          <div className={`p-5 rounded-2xl border ${
            isDark ? "bg-white/5 border-white/10" : "bg-zinc-50 border-zinc-200"
          }`}>
            <span className="text-[11px] font-black uppercase tracking-wider opacity-50 block mb-3">
              {t("guides.tocTitle")}
            </span>
            <ul className="space-y-2 text-xs font-bold">
              {article.tableOfContents.map((toc, index) => (
                <li key={toc.id}>
                  <a
                    href={`#${toc.id}`}
                    className="text-behance-blue hover:underline flex items-center gap-2"
                  >
                    <span className="opacity-40 font-mono text-[10px]">0{index + 1}.</span>
                    <span>{toc.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 4. MAIN ARTICLE CONTENT */}
      <article className="max-w-3xl mx-auto px-4 pb-12 prose dark:prose-invert prose-headings:font-black prose-headings:tracking-tight prose-a:text-behance-blue prose-img:rounded-2xl text-sm sm:text-base leading-relaxed space-y-6">
        <div
          dangerouslySetInnerHTML={{ __html: article.contentHtml }}
          className="space-y-5"
        />

        {/* IN-ARTICLE CTA INTERACTIVE BOX */}
        <div className={`my-10 p-6 sm:p-8 rounded-3xl border text-center space-y-4 shadow-xl ${
          isDark
            ? "bg-gradient-to-r from-blue-900/30 via-[#141418] to-blue-950/20 border-blue-500/30 text-white"
            : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-zinc-900"
        }`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-behance-blue/15 text-behance-blue text-xs font-bold uppercase">
            <span>⚡</span>
            <span>{t("guides.checkCaseBadge")}</span>
          </div>

          <h3 className="text-lg sm:text-xl font-black">
            {t("guides.checkCaseTitle")}
          </h3>

          <p className="text-xs sm:text-sm opacity-75 max-w-md mx-auto leading-relaxed">
            {t("guides.checkCaseDesc")}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate("/auth")}
              type="button"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-behance-blue hover:bg-behance-darkBlue text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-blue-500/25 cursor-pointer"
            >
              {t("guides.checkCaseBtn")}
            </button>
            <button
              onClick={() => navigate("/demo")}
              type="button"
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-zinc-200 dark:bg-white/10 hover:bg-zinc-300 dark:hover:bg-white/20 text-xs font-bold transition-all cursor-pointer"
            >
              {t("guides.tryDemoBtn")}
            </button>
          </div>
        </div>

        {/* TAGS KEYWORDS FOOTER */}
        <div className="pt-6 border-t border-zinc-200 dark:border-white/10 space-y-2">
          <span className="text-[11px] font-black uppercase opacity-40 block">{t("guides.keywordsTitle")}</span>
          <div className="flex flex-wrap gap-1.5">
            {article.keywords.map((kw) => (
              <span
                key={kw}
                className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-white/5 text-[11px] font-medium opacity-70"
              >
                #{kw}
              </span>
            ))}
          </div>
        </div>
      </article>

      {/* 5. RELATED ARTICLES */}
      {relatedArticles.length > 0 && (
        <section className={`py-12 border-t transition-all ${
          isDark ? "bg-[#0d0d10] border-white/10" : "bg-white border-zinc-200"
        }`}>
          <div className="max-w-4xl mx-auto px-4 space-y-6">
            <h3 className="text-xl font-black">{t("guides.readAlso")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedArticles.map((item) => (
                <div
                  key={item.slug}
                  onClick={() => navigate(`/guides/${item.slug}`)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group hover:-translate-y-1 ${
                    isDark
                      ? "bg-[#141418] border-white/5 hover:border-behance-blue/40"
                      : "bg-zinc-50 border-zinc-200 hover:border-behance-blue/40 hover:shadow-lg"
                  }`}
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-behance-blue">
                      {item.categoryLabel}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold leading-snug group-hover:text-behance-blue transition-colors">
                      {item.title}
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-behance-blue mt-4 block">
                    {t("guides.readBtn")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
