import React from "react";
import { useTheme } from "../context/ThemeContextInstance";
import { useTranslation } from "react-i18next";

interface FooterProps {
  // Пропсы для навигации по документам (опционально)
  onNavigate?: (view: "terms" | "privacy" | "refund") => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  // Хелпер для рендера ссылки или кнопки
  const LegalLink = ({ label, view, link }: { label: string; view: "terms" | "privacy" | "refund"; link: string }) => {
    const className =
      "text-[11px] font-black uppercase tracking-[0.2em] text-behance-muted hover:text-behance-blue transition-all border-b-2 border-transparent hover:border-behance-blue/20 pb-1 cursor-pointer bg-transparent border-none";

    // Если передана функция навигации — используем её (SPA режим)
    if (onNavigate) {
      return (
        <button onClick={() => onNavigate(view)} className={className}>
          {label}
        </button>
      );
    }
    // Если нет — обычная ссылка на HTML (для роботов/модераторов)
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
      </a>
    );
  };

  return (
    <footer
      className={`mt-auto py-20 px-16 border-t transition-colors flex flex-col xl:flex-row justify-between items-center gap-16 ${
        isDark ? "bg-[#0d0d0d] border-white/5" : "bg-white border-behance-border shadow-[0_-10px_40px_rgba(0,0,0,0.02)]"
      }`}
    >
      {/* 1. БРЕНДИНГ */}
      <div className="flex flex-col items-center xl:items-start gap-4 flex-1">
        <span className="text-[18px] font-black uppercase tracking-[0.4em] text-behance-blue">BeRanked</span>
        <div className="flex flex-col gap-1 opacity-40 items-center xl:items-start">
          <span className="text-[11px] font-bold uppercase tracking-widest whitespace-nowrap">© 2026 {t("footer.developed")}</span>
          <span className="text-[10px] font-medium uppercase tracking-tight">Харин Владислав • ИНН 563811937786</span>
        </div>
      </div>

      {/* 2. ПЛАТЕЖНЫЕ СИСТЕМЫ */}
      <div className="flex flex-col items-center gap-5 flex-1">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 uppercase">{t("common.securePayments")}</span>
        <img
          src="/payments.png"
          alt="Visa, Mastercard, Mir"
          className={`h-12 w-auto object-contain transition-all duration-500 ${
            isDark ? "brightness-200 grayscale opacity-60 hover:opacity-100 hover:grayscale-0" : "opacity-90 hover:opacity-100"
          }`}
        />
      </div>

      {/* 3. ДОКУМЕНТЫ */}
      <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 flex-1">
        <LegalLink label={t("footer.legal.offer")} view="terms" link="/terms.html" />
        <LegalLink label={t("footer.legal.privacy")} view="privacy" link="/privacy.html" />
        <LegalLink label={t("footer.legal.refund")} view="refund" link="/refund.html" />
      </div>

      {/* 4. ПОДДЕРЖКА */}
      <div className="flex flex-col items-center xl:items-end gap-3 flex-1">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 text-center xl:text-right">
          {t("common.support")}
        </span>
        <a
          href="mailto:dom.craft.digital@gmail.com"
          className="text-[13px] font-black uppercase tracking-widest text-behance-blue hover:text-blue-400 transition-colors border-b-2 border-behance-blue/10 hover:border-behance-blue"
        >
          dom.craft.digital@gmail.com
        </a>
      </div>
    </footer>
  );
};
