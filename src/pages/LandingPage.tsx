import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContextInstance";
import { GUIDES_ARTICLES } from "../data/guidesData";

interface LandingPageProps {
  onNavigateAuth: (mode?: "login" | "register") => void;
  onTryDemo: () => void;
  onNavigatePlans: () => void;
  onNavigateLegal: (view: "privacy" | "terms" | "refund" | "help") => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateAuth,
  onTryDemo,
  onNavigatePlans,
  onNavigateLegal,
}) => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleLanguage = () => {
    const nextLang = i18n.language === "ru" ? "en" : "ru";
    i18n.changeLanguage(nextLang);
  };

  const faqItems = [
    { q: t("landing.faq.q1"), a: t("landing.faq.a1") },
    { q: t("landing.faq.q2"), a: t("landing.faq.a2") },
    { q: t("landing.faq.q3"), a: t("landing.faq.a3") },
    { q: t("landing.faq.q4"), a: t("landing.faq.a4") },
    { q: t("landing.faq.q5"), a: t("landing.faq.a5") },
    { q: t("landing.faq.q6"), a: t("landing.faq.a6") },
  ];

  // Schema.org JSON-LD Structured Data
  const schemaJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "BeRanked",
        "applicationCategory": "DesignApplication",
        "operatingSystem": "Web",
        "url": "https://beranked.domcraft.digital/",
        "description": t("landing.hero.subtitle"),
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "RUB",
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "128",
        },
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqItems.map((item) => ({
          "@type": "Question",
          "name": item.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.a,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-behance-grayBg dark:bg-behance-darkBg text-zinc-900 dark:text-white transition-colors duration-200 selection:bg-behance-blue selection:text-white">
      {/* 0. SEO SCHEMA.ORG JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
      />

      {/* 1. STICKY HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-[#0f0f13]/80 border-b border-zinc-200/80 dark:border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-behance-blue text-white flex items-center justify-center font-black text-lg shadow-sm shadow-blue-500/30">
              B
            </div>
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-behance-blue to-indigo-500 bg-clip-text text-transparent">
              BeRanked
            </span>
          </div>

          {/* NAV LINKS (DESKTOP) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold opacity-75 hover:opacity-100 transition-opacity">
            <a href="#features" className="hover:text-behance-blue transition-colors">
              {t("landing.nav.features")}
            </a>
            <a href="#safety" className="hover:text-behance-blue transition-colors flex items-center gap-1">
              <span>🛡️</span>
              <span>{t("landing.nav.safety")}</span>
            </a>
            <a href="#how-it-works" className="hover:text-behance-blue transition-colors">
              {t("landing.nav.howItWorks")}
            </a>
            <a href="#pricing" className="hover:text-behance-blue transition-colors">
              {t("landing.nav.pricing")}
            </a>
            <Link to="/guides" className="hover:text-behance-blue text-behance-blue transition-colors">
              📚 Гайды
            </Link>
            <a href="#faq" className="hover:text-behance-blue transition-colors">
              {t("landing.nav.faq")}
            </a>
          </nav>

          {/* ACTION BUTTONS & CONTROLS */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* LANG SWITCHER */}
            <button
              onClick={toggleLanguage}
              type="button"
              className="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-xs font-bold uppercase transition-all cursor-pointer"
              title="Switch Language"
            >
              {i18n.language === "ru" ? "RU" : "EN"}
            </button>

            {/* THEME TOGGLE */}
            <button
              onClick={toggleTheme}
              type="button"
              className="p-2 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-xs font-bold transition-all cursor-pointer"
              title="Toggle Theme"
            >
              {isDark ? "☀️" : "🌙"}
            </button>

            {/* LOGIN BUTTON */}
            <button
              onClick={() => onNavigateAuth("login")}
              type="button"
              className="hidden sm:inline-flex px-3.5 py-2 rounded-xl text-xs font-bold hover:text-behance-blue transition-colors cursor-pointer"
            >
              {t("landing.nav.login")}
            </button>

            {/* START FREE CTA */}
            <button
              onClick={() => onNavigateAuth("register")}
              type="button"
              className="px-4 py-2 rounded-xl bg-behance-blue hover:bg-behance-darkBlue text-white text-xs font-black uppercase tracking-wider transition-all shadow-sm shadow-blue-500/25 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              {t("landing.nav.startFree")}
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* SAFETY BADGE */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-behance-blue text-xs font-black uppercase tracking-wider animate-in fade-in">
            <span>{t("landing.hero.safetyBadge")}</span>
          </div>

          {/* MAIN H1 TITLE */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-[1.1] max-w-4xl mx-auto">
            {t("landing.hero.title")}
          </h1>

          {/* SUBTITLE */}
          <p className="text-sm sm:text-base md:text-lg opacity-75 max-w-2xl mx-auto leading-relaxed">
            {t("landing.hero.subtitle")}
          </p>

          {/* DUAL CTA BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              onClick={() => onNavigateAuth("register")}
              type="button"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-behance-blue hover:bg-behance-darkBlue text-white text-sm font-black uppercase tracking-wider transition-all shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              {t("landing.hero.startFreeBtn")}
            </button>

            <button
              onClick={onTryDemo}
              type="button"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-zinc-200/80 dark:bg-white/10 hover:bg-zinc-300 dark:hover:bg-white/20 text-xs sm:text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-zinc-300 dark:border-white/10"
            >
              {t("landing.hero.viewDemoBtn")}
            </button>
          </div>

          {/* TRUST PROOF NOTE */}
          <div className="pt-2 text-xs opacity-60 font-medium flex items-center justify-center gap-2">
            <span>{t("landing.hero.trustNote")}</span>
          </div>

          {/* INTERACTIVE MOCK PREVIEW CARD */}
          <div className="pt-8 max-w-4xl mx-auto">
            <div
              className={`p-5 sm:p-7 rounded-3xl border shadow-2xl transition-all ${
                isDark
                  ? "bg-[#141418] border-white/10 shadow-blue-500/5"
                  : "bg-white border-zinc-200 shadow-zinc-300/50"
              }`}
            >
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-behance-blue/10 text-behance-blue flex items-center justify-center font-bold text-lg">
                    📊
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black uppercase tracking-wider">
                      Behance Case Rankings #1
                    </div>
                    <div className="text-[11px] opacity-60">
                      Smart Watch UI/UX Design Case • 24 Tags Active
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-green-500/15 text-green-500 text-xs font-black font-mono">
                    ↑ ТОП-10 (8 тегов)
                  </span>
                </div>
              </div>

              {/* MOCK TAG CHIPS GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-left mb-4">
                <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-between">
                  <span className="text-xs font-bold text-green-500">#ui ux</span>
                  <span className="text-xs font-black font-mono bg-green-500 text-white px-2 py-0.5 rounded-md">
                    #2
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-between">
                  <span className="text-xs font-bold text-green-500">#mobile app</span>
                  <span className="text-xs font-black font-mono bg-green-500 text-white px-2 py-0.5 rounded-md">
                    #4
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-500">#dashboard</span>
                  <span className="text-xs font-black font-mono bg-amber-500 text-white px-2 py-0.5 rounded-md">
                    #14
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-500">#figma</span>
                  <span className="text-xs font-black font-mono bg-blue-500 text-white px-2 py-0.5 rounded-md">
                    #7
                  </span>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={onTryDemo}
                  type="button"
                  className="text-xs font-bold text-behance-blue hover:underline cursor-pointer"
                >
                  {t("landing.hero.viewDemoBtn")} →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SAFETY GUARANTEE SECTION (100% БЕЗОПАСНОСТЬ) */}
      <section id="safety" className="py-16 md:py-24 border-t border-zinc-200 dark:border-white/10 bg-blue-50/50 dark:bg-blue-950/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-wider border border-green-500/30">
              {t("landing.safety.tag")}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
              {t("landing.safety.title")}
            </h2>
            <p className="text-xs sm:text-sm opacity-70 leading-relaxed">
              {t("landing.safety.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className={`p-6 sm:p-8 rounded-3xl border transition-all ${
                isDark ? "bg-[#141418] border-white/10" : "bg-white border-zinc-200 shadow-sm"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center text-2xl mb-5">
                🚫
              </div>
              <h3 className="text-base font-black uppercase mb-2">
                {t("landing.safety.card1Title")}
              </h3>
              <p className="text-xs opacity-75 leading-relaxed">
                {t("landing.safety.card1Desc")}
              </p>
            </div>

            <div
              className={`p-6 sm:p-8 rounded-3xl border transition-all ${
                isDark ? "bg-[#141418] border-white/10" : "bg-white border-zinc-200 shadow-sm"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-behance-blue flex items-center justify-center text-2xl mb-5">
                🌐
              </div>
              <h3 className="text-base font-black uppercase mb-2">
                {t("landing.safety.card2Title")}
              </h3>
              <p className="text-xs opacity-75 leading-relaxed">
                {t("landing.safety.card2Desc")}
              </p>
            </div>

            <div
              className={`p-6 sm:p-8 rounded-3xl border transition-all ${
                isDark ? "bg-[#141418] border-white/10" : "bg-white border-zinc-200 shadow-sm"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center text-2xl mb-5">
                🛡️
              </div>
              <h3 className="text-base font-black uppercase mb-2">
                {t("landing.safety.card3Title")}
              </h3>
              <p className="text-xs opacity-75 leading-relaxed">
                {t("landing.safety.card3Desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES GRID */}
      <section id="features" className="py-16 md:py-24 border-t border-zinc-200 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-full bg-behance-blue/15 text-behance-blue text-[10px] font-black uppercase tracking-wider border border-behance-blue/30">
              {t("landing.features.tag")}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
              {t("landing.features.title")}
            </h2>
            <p className="text-xs sm:text-sm opacity-70 leading-relaxed">
              {t("landing.features.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={`p-6 rounded-3xl border ${isDark ? "bg-[#141418] border-white/10" : "bg-white border-zinc-200"}`}>
              <h3 className="text-sm font-black uppercase mb-2">{t("landing.features.f1Title")}</h3>
              <p className="text-xs opacity-75 leading-relaxed">{t("landing.features.f1Desc")}</p>
            </div>

            <div className={`p-6 rounded-3xl border ${isDark ? "bg-[#141418] border-white/10" : "bg-white border-zinc-200"}`}>
              <h3 className="text-sm font-black uppercase mb-2">{t("landing.features.f2Title")}</h3>
              <p className="text-xs opacity-75 leading-relaxed">{t("landing.features.f2Desc")}</p>
            </div>

            <div className={`p-6 rounded-3xl border ${isDark ? "bg-[#141418] border-white/10" : "bg-white border-zinc-200"}`}>
              <h3 className="text-sm font-black uppercase mb-2">{t("landing.features.f3Title")}</h3>
              <p className="text-xs opacity-75 leading-relaxed">{t("landing.features.f3Desc")}</p>
            </div>

            <div className={`p-6 rounded-3xl border ${isDark ? "bg-[#141418] border-white/10" : "bg-white border-zinc-200"}`}>
              <h3 className="text-sm font-black uppercase mb-2">{t("landing.features.f4Title")}</h3>
              <p className="text-xs opacity-75 leading-relaxed">{t("landing.features.f4Desc")}</p>
            </div>

            <div className={`p-6 rounded-3xl border ${isDark ? "bg-[#141418] border-white/10" : "bg-white border-zinc-200"}`}>
              <h3 className="text-sm font-black uppercase mb-2">{t("landing.features.f5Title")}</h3>
              <p className="text-xs opacity-75 leading-relaxed">{t("landing.features.f5Desc")}</p>
            </div>

            <div className={`p-6 rounded-3xl border ${isDark ? "bg-[#141418] border-white/10" : "bg-white border-zinc-200"}`}>
              <h3 className="text-sm font-black uppercase mb-2">{t("landing.features.f6Title")}</h3>
              <p className="text-xs opacity-75 leading-relaxed">{t("landing.features.f6Desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="py-16 md:py-24 border-t border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-full bg-purple-500/15 text-purple-500 text-[10px] font-black uppercase tracking-wider border border-purple-500/30">
              {t("landing.howItWorks.tag")}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
              {t("landing.howItWorks.title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-8 rounded-3xl border relative ${isDark ? "bg-[#141418] border-white/10" : "bg-white border-zinc-200"}`}>
              <div className="text-4xl font-black text-behance-blue/20 mb-4 font-mono">
                {t("landing.howItWorks.step1Num")}
              </div>
              <h3 className="text-base font-black uppercase mb-2">{t("landing.howItWorks.step1Title")}</h3>
              <p className="text-xs opacity-75 leading-relaxed">{t("landing.howItWorks.step1Desc")}</p>
            </div>

            <div className={`p-8 rounded-3xl border relative ${isDark ? "bg-[#141418] border-white/10" : "bg-white border-zinc-200"}`}>
              <div className="text-4xl font-black text-behance-blue/20 mb-4 font-mono">
                {t("landing.howItWorks.step2Num")}
              </div>
              <h3 className="text-base font-black uppercase mb-2">{t("landing.howItWorks.step2Title")}</h3>
              <p className="text-xs opacity-75 leading-relaxed">{t("landing.howItWorks.step2Desc")}</p>
            </div>

            <div className={`p-8 rounded-3xl border relative ${isDark ? "bg-[#141418] border-white/10" : "bg-white border-zinc-200"}`}>
              <div className="text-4xl font-black text-behance-blue/20 mb-4 font-mono">
                {t("landing.howItWorks.step3Num")}
              </div>
              <h3 className="text-base font-black uppercase mb-2">{t("landing.howItWorks.step3Title")}</h3>
              <p className="text-xs opacity-75 leading-relaxed">{t("landing.howItWorks.step3Desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRICING PREVIEW */}
      <section id="pricing" className="py-16 md:py-24 border-t border-zinc-200 dark:border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="space-y-3">
            <span className="px-3 py-1 rounded-full bg-green-500/15 text-green-500 text-[10px] font-black uppercase tracking-wider border border-green-500/30">
              {t("landing.pricingPreview.tag")}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
              {t("landing.pricingPreview.title")}
            </h2>
            <p className="text-xs sm:text-sm opacity-70 leading-relaxed">
              {t("landing.pricingPreview.subtitle")}
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onNavigatePlans}
              type="button"
              className="px-8 py-4 rounded-2xl bg-behance-blue hover:bg-behance-darkBlue text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-md shadow-blue-500/25 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              {t("landing.pricingPreview.viewAllPlansBtn")}
            </button>
          </div>
        </div>
      </section>

      {/* 6.5. SEO GUIDES SECTION (KNOWLEDGE BASE PREVIEW) */}
      <section className="py-16 md:py-24 border-t border-zinc-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/15 text-behance-blue text-[10px] font-black uppercase tracking-wider border border-blue-500/30">
                📚 База знаний
              </span>
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
                Полезные SEO-гайды для дизайнеров
              </h2>
              <p className="text-xs sm:text-sm opacity-70">
                Практические статьи о продвижении кейсов, подборе тегов и алгоритмах поиска.
              </p>
            </div>

            <Link
              to="/guides"
              className="text-xs font-black uppercase tracking-wider text-behance-blue hover:underline shrink-0 flex items-center gap-1"
            >
              <span>Все статьи (6)</span>
              <span>➔</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {GUIDES_ARTICLES.slice(0, 3).map((article) => (
              <Link
                key={article.slug}
                to={`/guides/${article.slug}`}
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between group hover:-translate-y-1 shadow-sm ${
                  isDark
                    ? "bg-[#141418] border-white/10 hover:border-behance-blue/40"
                    : "bg-white border-zinc-200 hover:border-behance-blue/40 hover:shadow-xl"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-behance-blue text-[10px] font-black uppercase tracking-wider">
                      {article.categoryLabel}
                    </span>
                    <span className="opacity-40 text-[10px] font-mono">
                      ⏱ {article.readTime}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-black leading-snug group-hover:text-behance-blue transition-colors">
                    {article.title}
                  </h3>

                  <p className="text-xs opacity-70 leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>

                <span className="text-xs font-bold text-behance-blue mt-6 block group-hover:translate-x-1 transition-transform">
                  Читать гайд ➔
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ SECTION (SCHEMA.ORG RICH SNIPPET) */}
      <section id="faq" className="py-16 md:py-24 border-t border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <span className="px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-500 text-[10px] font-black uppercase tracking-wider border border-indigo-500/30">
              {t("landing.faq.tag")}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
              {t("landing.faq.title")}
            </h2>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isDark ? "bg-[#141418] border-white/10" : "bg-white border-zinc-200 shadow-xs"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    type="button"
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <span className="text-base text-behance-blue transition-transform duration-200">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs opacity-75 leading-relaxed border-t border-zinc-100 dark:border-white/5 animate-in fade-in">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="py-16 md:py-24 border-t border-zinc-200 dark:border-white/10 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
            {t("landing.cta.title")}
          </h2>
          <p className="text-xs sm:text-sm opacity-70 max-w-lg mx-auto leading-relaxed">
            {t("landing.cta.subtitle")}
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigateAuth("register")}
              type="button"
              className="px-9 py-4 rounded-2xl bg-behance-blue hover:bg-behance-darkBlue text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-xl shadow-blue-500/30 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              {t("landing.cta.btn")}
            </button>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="py-10 border-t border-zinc-200 dark:border-white/10 text-xs opacity-70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold">
            <span>© 2026 BeRanked. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 font-medium">
            <button
              onClick={() => onNavigateLegal("help")}
              type="button"
              className="hover:underline cursor-pointer"
            >
              {t("footer.help")}
            </button>
            <button
              onClick={onNavigatePlans}
              type="button"
              className="hover:underline cursor-pointer"
            >
              {t("landing.nav.pricing")}
            </button>
            <button
              onClick={() => onNavigateLegal("terms")}
              type="button"
              className="hover:underline cursor-pointer"
            >
              {t("footer.terms")}
            </button>
            <button
              onClick={() => onNavigateLegal("privacy")}
              type="button"
              className="hover:underline cursor-pointer"
            >
              {t("footer.privacy")}
            </button>
            <button
              onClick={() => onNavigateLegal("refund")}
              type="button"
              className="hover:underline cursor-pointer"
            >
              {t("footer.refund")}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
