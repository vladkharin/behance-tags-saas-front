import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContextInstance";
import { useTranslation, Trans } from "react-i18next";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../hooks/useAuth";
import { Footer } from "../components/Footer";
import { analyticsService } from "../services/analyticsService";

type Currency = "RUB" | "USD";

interface PlansProps {
  onBack: () => void;
  onNavigateLegal: (view: "help" | "plans" | "terms" | "privacy" | "refund") => void;
}

export const Plans: React.FC<PlansProps> = ({ onBack, onNavigateLegal }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const isDark = theme === "dark";
  const [currency, setCurrency] = useState<Currency>("RUB");
  const [loadingTarget, setLoadingTarget] = useState<string | null>(null);

  const handlePurchase = async (target: string, type: "PLAN" | "FUEL") => {
    if (target === "FREE" || loadingTarget) return;

    if (!isAuthenticated) {
      showToast(
        i18n.language === "ru"
          ? "Для выбора тарифа создайте бесплатный аккаунт или войдите!"
          : "Please log in or register to select a plan!",
        "info"
      );
      navigate("/auth");
      return;
    }

    setLoadingTarget(target);
    try {
      const res = await analyticsService.createPayment({ target, type, currency });
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      showToast(
        i18n.language === "ru"
          ? "Не удалось инициализировать оплату. Попробуйте позже."
          : "Failed to initialize payment. Please try again later.",
        "error"
      );
    } finally {
      setLoadingTarget(null);
    }
  };

  const PLANS = [
    {
      id: "FREE",
      name: t("plans.names.free"),
      price: { RUB: "0 ₽", USD: "$0" },
      description: t("plans.descriptions.free"),
      features: [
        { label: t("plans.features.slot1"), status: true },
        { label: t("plans.features.update7"), status: true },
        { label: t("plans.features.limit90"), status: true },
        { label: t("plans.features.customTags"), status: false },
      ],
      buttonText: t("plans.buttons.current"),
      highlight: false,
    },
    {
      id: "DAILY_FRESH",
      name: t("plans.names.daily"),
      price: { RUB: "890 ₽", USD: "$9.99" },
      period: t("common.monthShort"),
      description: t("plans.descriptions.daily"),
      features: [
        { label: t("plans.features.slot3"), status: true },
        { label: t("plans.features.update3"), status: true },
        { label: t("plans.features.limit1500"), status: true },
        { label: t("plans.features.customTags"), status: true },
        { label: t("plans.features.charts"), status: true },
      ],
      buttonText: t("plans.buttons.selectDaily"),
      highlight: true,
    },
    {
      id: "PRO_STREAM",
      name: t("plans.names.pro"),
      price: { RUB: "2 250 ₽", USD: "$24.99" },
      period: t("common.monthShort"),
      description: t("plans.descriptions.pro"),
      features: [
        { label: t("plans.features.slot10"), status: true },
        { label: t("plans.features.updateDaily"), status: true },
        { label: t("plans.features.limit6000"), status: true },
        { label: t("plans.features.customTags"), status: true },
        { label: t("plans.features.trends"), status: true },
      ],
      buttonText: t("plans.buttons.getPro"),
      highlight: false,
      premium: true,
    },
  ];

  const FUEL_PACKS = [
    { id: "500", amount: "500", price: { RUB: "290 ₽", USD: "$2.99" }, icon: "⛽" },
    { id: "2000", amount: "2000", price: { RUB: "690 ₽", USD: "$6.99" }, icon: "🔥" },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-500 flex flex-col ${
        isDark ? "bg-[#0a0a0a] text-white" : "bg-behance-grayBg text-behance-black"
      }`}
    >
      {/* HEADER */}
      <header className="py-8 px-6 md:px-16 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div
          className="flex items-center gap-4 cursor-pointer transition-all hover:opacity-70"
          onClick={onBack}
        >
          <span className="text-xl font-black uppercase tracking-[0.35em] text-behance-blue">
            BeRanked
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => i18n.changeLanguage(i18n.language === "ru" ? "en" : "ru")}
            type="button"
            className={`text-[10px] font-black w-9 h-9 rounded-full shadow-sm flex items-center justify-center cursor-pointer ${
              isDark ? "bg-white/5 text-blue-400" : "bg-white"
            }`}
          >
            {i18n.language.toUpperCase().substring(0, 2)}
          </button>
          <button
            onClick={toggleTheme}
            type="button"
            className={`w-9 h-9 rounded-full shadow-sm flex items-center justify-center cursor-pointer text-xs ${
              isDark ? "bg-white/5 text-yellow-400" : "bg-white"
            }`}
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-16 py-8 md:py-12">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-6 leading-tight">
            <Trans i18nKey="plans.header.title" />
          </h1>

          <div className="inline-flex p-1.5 rounded-2xl bg-gray-200/60 dark:bg-white/5 backdrop-blur-md mb-8 shadow-inner text-black dark:text-white font-black">
            <button
              onClick={() => setCurrency("RUB")}
              type="button"
              className={`px-6 md:px-8 py-2 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer ${
                currency === "RUB" ? "bg-white dark:bg-behance-blue shadow-md text-behance-black dark:text-white" : "opacity-40 hover:opacity-80"
              }`}
            >
              RUB
            </button>
            <button
              onClick={() => setCurrency("USD")}
              type="button"
              className={`px-6 md:px-8 py-2 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer ${
                currency === "USD" ? "bg-white dark:bg-behance-blue shadow-md text-behance-black dark:text-white" : "opacity-40 hover:opacity-80"
              }`}
            >
              USD
            </button>
          </div>

          <p className="text-[11px] opacity-40 font-bold uppercase tracking-[0.25em]">
            {t("plans.header.subtitle")}
          </p>
        </div>

        {/* PLANS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-20 md:mb-32 items-stretch">
          {PLANS.map((plan, i) => (
            <div
              key={i}
              className={`p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border transition-all duration-300 flex flex-col ${
                plan.highlight
                  ? "border-behance-blue bg-behance-blue/5 shadow-2xl md:scale-105 z-10"
                  : isDark
                    ? "bg-[#111111] border-white/5 shadow-inner"
                    : "bg-white border-behance-border shadow-sm"
              }`}
            >
              <div className="mb-8">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-3 opacity-40">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl md:text-5xl font-black tracking-tighter">
                    {plan.price[currency]}
                  </span>
                  {plan.period && <span className="text-sm md:text-base opacity-30 font-bold">{plan.period}</span>}
                </div>
                <p className="mt-4 text-[10px] font-bold leading-relaxed opacity-60 uppercase">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-start gap-3 text-[11px] font-black uppercase tracking-tight">
                    {feat.status ? (
                      <span className="text-green-500 shrink-0">✓</span>
                    ) : (
                      <span className="text-red-500 shrink-0">✕</span>
                    )}
                    <span className={feat.status ? "opacity-100" : "opacity-30"}>
                      {feat.label}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePurchase(plan.id, "PLAN")}
                disabled={plan.id === "FREE" || !!loadingTarget}
                type="button"
                className={`w-full py-4 md:py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  loadingTarget === plan.id ? "animate-pulse" : ""
                } ${
                  plan.premium
                    ? "bg-white text-black hover:bg-behance-blue hover:text-white"
                    : plan.highlight
                      ? "bg-behance-blue text-white shadow-xl shadow-blue-500/25"
                      : "bg-black text-white hover:bg-behance-blue dark:bg-white/10 dark:hover:bg-behance-blue"
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* FUEL PACKS */}
        <div
          className={`p-8 md:p-16 rounded-[3rem] md:rounded-[4rem] border transition-all ${
            isDark ? "bg-[#0d0d0d] border-white/5 shadow-inner" : "bg-white border-behance-border shadow-2xl"
          }`}
        >
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8 md:gap-12 text-center lg:text-left">
            <div className="max-w-md">
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-3 italic">
                {t("plans.fuel.title")}
              </h2>
              <p className="text-[11px] font-bold uppercase opacity-40 tracking-widest leading-loose">
                {t("plans.fuel.desc")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full lg:w-auto">
              {FUEL_PACKS.map((pack, i) => (
                <div
                  key={i}
                  className={`p-8 rounded-[2.5rem] border transition-all ${
                    isDark ? "bg-white/5 border-white/5" : "bg-behance-grayBg border-transparent"
                  }`}
                >
                  <span className="text-3xl mb-4 block">{pack.icon}</span>
                  <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">
                    {t("plans.fuel.pack", { amount: pack.amount })}
                  </h4>
                  <p className="text-2xl font-black mb-6">
                    {pack.amount} {t("dashboard.metrics.tags")}
                  </p>
                  <button
                    onClick={() => handlePurchase(pack.id, "FUEL")}
                    disabled={!!loadingTarget}
                    type="button"
                    className="w-full bg-behance-blue text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {t("plans.fuel.buy", { price: pack.price[currency] })}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer onNavigate={onNavigateLegal} />
    </div>
  );
};
