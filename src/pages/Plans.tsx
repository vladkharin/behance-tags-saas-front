import React, { useState } from "react";
import { useTheme } from "../context/ThemeContextInstance";

type Currency = "RUB" | "USD";

const PLANS = [
  {
    name: "Free",
    price: { RUB: "0 ₽", USD: "$0" },
    description: "Для тех, кто только начинает путь на Behance",
    features: ["1 активный слот для проекта", "Обновление раз в 7 дней", "Месячный лимит: 90 тегов", "Базовая статистика"],
    buttonText: "Текущий план",
    highlight: false,
  },
  {
    name: "Daily Fresh",
    price: { RUB: "890 ₽", USD: "$9.99" },
    period: "/мес",
    description: "Оптимально для активных дизайнеров",
    features: [
      "3 активных слота для проектов",
      "Обновление каждые 3 дня",
      "Месячный лимит: 1 500 тегов",
      "Кастомные теги через инпут",
      "История позиций на графиках",
    ],
    buttonText: "Выбрать Daily",
    highlight: true,
  },
  {
    name: "Pro Stream",
    price: { RUB: "2 250 ₽", USD: "$24.99" },
    period: "/мес",
    description: "Для студий и топ-мейкеров",
    features: [
      "До 10 активных слотов",
      "Авто-обновление каждые 24 часа",
      "Месячный лимит: 6 000 тегов",
      "Полная аналитика и экспорт",
      "Приоритетная поддержка",
    ],
    buttonText: "Получить PRO",
    highlight: false,
    premium: true,
  },
];

const FUEL_PACKS = [
  { name: "Pack 500", tags: "500 тегов", price: { RUB: "290 ₽", USD: "$2.99" }, icon: "⛽" },
  { name: "Pack 2000", tags: "2000 тегов", price: { RUB: "690 ₽", USD: "$6.99" }, icon: "🔥" },
];

interface PlansProps {
  onBack: () => void;
}

export const Plans: React.FC<PlansProps> = ({ onBack }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  // Состояние валюты (по умолчанию рубли)
  const [currency, setCurrency] = useState<Currency>("RUB");

  return (
    <div
      className={`min-h-screen transition-colors duration-500 flex flex-col ${isDark ? "bg-[#0a0a0a] text-white" : "bg-behance-grayBg text-behance-black"}`}
    >
      {/* HEADER */}
      <header className="py-10 px-16 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4 cursor-pointer" onClick={onBack}>
          <span className="text-[20px] font-black uppercase tracking-[0.4em] text-behance-blue transition-all hover:opacity-70">
            BeRanked
          </span>
        </div>
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-full transition-all hover:scale-110 ${isDark ? "bg-white/5 text-yellow-400" : "bg-white shadow-sm text-gray-400"}`}
        >
          {isDark ? "☀️" : "🌙"}
        </button>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-16 py-12">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-black tracking-tighter uppercase mb-8 leading-none">
            Выберите уровень <br /> продвижения
          </h1>

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

          <p className="text-[11px] opacity-30 font-bold uppercase tracking-[0.3em]">Прозрачные тарифы для любого масштаба</p>
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
                  <span className="text-5xl font-black tracking-tighter animate-in fade-in duration-300">{plan.price[currency]}</span>
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
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 italic">Закончились лимиты?</h2>
              <p className="text-[11px] font-bold uppercase opacity-30 tracking-widest leading-loose">
                Докупите пакеты тегов "Fuel", чтобы мгновенно продолжить мониторинг, не дожидаясь начала нового месяца.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {FUEL_PACKS.map((pack, i) => (
                <div
                  key={i}
                  className={`p-10 rounded-[3rem] border text-center transition-all ${isDark ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-behance-grayBg border-transparent hover:border-behance-blue/20"}`}
                >
                  <span className="text-4xl mb-6 block">{pack.icon}</span>
                  <h4 className="text-[11px] font-black uppercase tracking-widest opacity-40 mb-2">{pack.name}</h4>
                  <p className="text-2xl font-black mb-6">{pack.tags}</p>
                  <button className="bg-behance-blue text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-blue-500/20 hover:scale-105 transition-all">
                    Купить {pack.price[currency]}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer
        className={`py-20 px-16 border-t transition-colors flex flex-col xl:flex-row justify-between items-center gap-16 ${isDark ? "bg-[#0d0d0d] border-white/5" : "bg-white border-behance-border shadow-[0_-10px_40px_rgba(0,0,0,0.02)]"}`}
      >
        <div className="flex flex-col items-center xl:items-start gap-4 flex-1">
          <span className="text-[18px] font-black uppercase tracking-[0.4em] text-behance-blue">BeRanked</span>
          <div className="flex flex-col gap-1 opacity-40 items-center xl:items-start">
            <span className="text-[11px] font-bold uppercase tracking-widest whitespace-nowrap">© 2026 Product by DomCraft Digital</span>
            <span className="text-[10px] font-medium uppercase tracking-tight">Харин Владислав • ИНН 563811937786</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-5 flex-1">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Secure Payments</span>
          <img
            src="/payments.png"
            alt="Visa, Mastercard, Mir"
            className={`h-12 w-auto object-contain transition-all duration-500 ${isDark ? "brightness-200 grayscale opacity-60 hover:opacity-100 hover:grayscale-0" : "opacity-90 hover:opacity-100"}`}
          />
        </div>
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 flex-1">
          {[
            { label: "Оферта", link: "/terms.html" },
            { label: "Приватность", link: "/privacy.html" },
            { label: "Возврат", link: "/refund.html" },
          ].map((doc, idx) => (
            <a
              key={idx}
              href={doc.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-black uppercase tracking-[0.2em] text-behance-muted hover:text-behance-blue transition-all border-b-2 border-transparent hover:border-behance-blue/20 pb-1"
            >
              {doc.label}
            </a>
          ))}
        </div>
        <div className="flex flex-col items-center xl:items-end gap-3 flex-1">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 text-center xl:text-right">Direct Support</span>
          <a
            href="mailto:dom.craft.digital@gmail.com"
            className="text-[13px] font-black uppercase tracking-widest text-behance-blue hover:text-blue-400 transition-colors border-b-2 border-behance-blue/10 hover:border-behance-blue"
          >
            dom.craft.digital@gmail.com
          </a>
        </div>
      </footer>
    </div>
  );
};
