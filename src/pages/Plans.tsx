import React, { useState } from "react";
import { useTheme } from "../context/ThemeContextInstance";
import { useTranslation } from "react-i18next";
import { Footer } from "../components/Footer";

type Currency = "RUB" | "USD";

export const Plans: React.FC<{ onBack: () => void; onNavigateLegal: () => void }> = ({ onBack, onNavigateLegal }) => {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const isDark = theme === "dark";

  const [currency, setCurrency] = useState<Currency>("RUB");

  const toggleLanguage = () => {
    const newLang = i18n.language === "ru" ? "en" : "ru";
    i18n.changeLanguage(newLang);
  };

  const PLANS = [
    {
      name: t("plans.names.free"),
      price: { RUB: "0 ₽", USD: "$0" },
      description: t("plans.descriptions.free"),
      features: [t("plans.features.slot1"), t("plans.features.update7"), t("plans.features.limit90"), t("plans.features.stats")],
      buttonText: t("plans.buttons.current"),
      highlight: false,
    },
    {
      name: t("plans.names.daily"),
      price: { RUB: "890 ₽", USD: "$9.99" },
      period: t("common.monthShort") || "/мес",
      description: t("plans.descriptions.daily"),
      features: [
        t("plans.features.slot3"),
        t("plans.features.update3"),
        t("plans.features.limit1500"),
        t("plans.features.input"),
        t("plans.features.charts"),
      ],
      buttonText: t("plans.buttons.selectDaily"),
      highlight: true,
    },
    {
      name: t("plans.names.pro"),
      price: { RUB: "2 250 ₽", USD: "$24.99" },
      period: t("common.monthShort") || "/мес",
      description: t("plans.descriptions.pro"),
      features: [
        t("plans.features.slot10"),
        t("plans.features.update24"),
        t("plans.features.limit6000"),
        t("plans.features.export"),
        t("plans.features.priority"),
      ],
      buttonText: t("plans.buttons.getPro"),
      highlight: false,
      premium: true,
    },
  ];

  const FUEL_PACKS = [
    { amount: "500", count: "500", price: { RUB: "290 ₽", USD: "$2.99" }, icon: "⛽" },
    { amount: "2000", count: "2000", price: { RUB: "690 ₽", USD: "$6.99" }, icon: "🔥" },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-500 flex flex-col ${isDark ? "bg-[#0a0a0a] text-white" : "bg-behance-grayBg text-behance-black"}`}
    >
      {/* HEADER */}
      <header className="py-10 px-16 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4 cursor-pointer transition-all hover:opacity-70" onClick={onBack}>
          <span className="text-[20px] font-black uppercase tracking-[0.4em] text-behance-blue">BeRanked</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleLanguage}
            className={`text-[10px] font-black w-10 h-10 rounded-full transition-all hover:scale-110 shadow-sm ${isDark ? "bg-white/5 text-blue-400" : "bg-white text-gray-500"}`}
          >
            {i18n.language.toUpperCase().substring(0, 2)}
          </button>
          <button
            onClick={toggleTheme}
            className={`p-3 rounded-full transition-all hover:scale-110 ${isDark ? "bg-white/5 text-yellow-400" : "bg-white shadow-sm text-gray-400"}`}
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-16 py-12">
        <div className="text-center mb-16">
          <h1
            className="text-6xl font-black tracking-tighter uppercase mb-8 leading-none"
            dangerouslySetInnerHTML={{ __html: t("plans.header.title") }}
          />

          {/* CURRENCY SWITCHER */}
          <div className="inline-flex p-1.5 rounded-2xl bg-gray-200/50 dark:bg-white/5 backdrop-blur-md mb-12 shadow-inner">
            <button
              onClick={() => setCurrency("RUB")}
              className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currency === "RUB" ? "bg-white dark:bg-behance-blue text-black dark:text-white shadow-md" : "opacity-40"}`}
            >
              RUB
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currency === "USD" ? "bg-white dark:bg-behance-blue text-black dark:text-white shadow-md" : "opacity-40"}`}
            >
              USD
            </button>
          </div>

          <p className="text-[11px] opacity-30 font-bold uppercase tracking-[0.3em]">{t("plans.header.subtitle")}</p>
        </div>

        {/* ТАРИФЫ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 items-stretch">
          {PLANS.map((plan, i) => (
            <div
              key={i}
              className={`p-12 rounded-[3.5rem] border transition-all duration-500 flex flex-col ${plan.highlight ? "border-behance-blue bg-behance-blue/5 shadow-2xl scale-105 z-10" : isDark ? "bg-[#111111] border-white/5" : "bg-white border-behance-border shadow-sm"}`}
            >
              <div className="mb-10">
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] mb-4 opacity-40">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tighter">{plan.price[currency]}</span>
                  {plan.period && <span className="text-lg opacity-30 font-bold">{plan.period}</span>}
                </div>
                <p className="mt-4 text-[10px] font-bold leading-relaxed opacity-60 uppercase">{plan.description}</p>
              </div>
              <ul className="space-y-5 mb-12 flex-1">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-start gap-3 text-[11px] font-black uppercase tracking-tight">
                    <span className="text-behance-blue">✓</span>
                    <span className="opacity-80">{feat}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${plan.premium ? "bg-white text-black hover:bg-behance-blue hover:text-white" : plan.highlight ? "bg-behance-blue text-white shadow-xl shadow-blue-500/20" : isDark ? "bg-white/5 text-white hover:bg-white/10" : "bg-black text-white hover:bg-behance-blue"}`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* FUEL PACKS */}
        <div
          className={`p-16 rounded-[4rem] border transition-all ${isDark ? "bg-[#0d0d0d] border-white/5 shadow-inner" : "bg-white border-behance-border shadow-2xl shadow-blue-900/5"}`}
        >
          <div className="flex flex-col lg:flex-row justify-between items-center gap-12">
            <div className="max-w-md text-center lg:text-left">
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 italic">{t("plans.fuel.title")}</h2>
              <p className="text-[11px] font-bold uppercase opacity-30 tracking-widest leading-loose">{t("plans.fuel.desc")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {FUEL_PACKS.map((pack, i) => (
                <div
                  key={i}
                  className={`p-10 rounded-[3rem] border text-center transition-all ${isDark ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-behance-grayBg border-transparent hover:border-behance-blue/20"}`}
                >
                  <span className="text-4xl mb-6 block">{pack.icon}</span>
                  <h4 className="text-[11px] font-black uppercase tracking-widest opacity-40 mb-2">
                    {t("plans.fuel.pack", { amount: pack.amount })}
                  </h4>
                  <p className="text-2xl font-black mb-6">{t("plans.fuel.tags", { count: pack.count })}</p>
                  <button className="bg-behance-blue text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-blue-500/20 hover:scale-105 transition-all">
                    {t("plans.fuel.buy", { price: pack.price[currency] })}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <Footer onNavigate={(view) => onNavigateLegal(view)} />
    </div>
  );
};
