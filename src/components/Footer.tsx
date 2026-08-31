import React from "react";
import { useTheme } from "../context/ThemeContextInstance";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface FooterProps {
  onNavigate?: (view: "help" | "plans" | "terms" | "privacy" | "refund") => void;
  onNavigateLegal?: (view: "help" | "plans" | "terms" | "privacy" | "refund") => void;
  onNavigatePricing?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onNavigateLegal,
  onNavigatePricing,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  const handleNav = onNavigateLegal || onNavigate;

  const LegalLink = ({ label, view }: { label: string; view: "terms" | "privacy" | "refund" | "help" | "plans" }) => {
    const className =
      "text-[11px] font-black uppercase tracking-[0.2em] text-behance-muted hover:text-behance-blue transition-all border-b-2 border-transparent hover:border-behance-blue/20 pb-1 cursor-pointer bg-transparent border-none";

    if (handleNav) {
      return (
        <button onClick={() => handleNav(view as any)} type="button" className={className}>
          {label}
        </button>
      );
    }

    return (
      <Link to={`/${view}`} className={className}>
        {label}
      </Link>
    );
  };

  return (
    <footer
      className={`mt-auto py-12 md:py-16 px-6 md:px-16 border-t transition-colors flex flex-col xl:flex-row justify-between items-center gap-10 md:gap-16 ${
        isDark ? "bg-[#0d0d0d] border-white/5" : "bg-white border-behance-border shadow-[0_-10px_40px_rgba(0,0,0,0.02)]"
      }`}
    >
      {/* 1. BRANDING */}
      <div className="flex flex-col items-center xl:items-start gap-3 flex-1 text-center xl:text-left">
        <Link to="/" className="text-lg font-black uppercase tracking-[0.35em] text-behance-blue hover:opacity-80">
          BeRanked
        </Link>
        <div className="flex flex-col gap-1 opacity-40 items-center xl:items-start">
          <span className="text-[11px] font-bold uppercase tracking-widest whitespace-nowrap">
            © 2026 {t("footer.developed")}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-tight">
            Харин Владислав • ИНН 563811937786
          </span>
        </div>
      </div>

      {/* 2. PAYMENT SYSTEMS */}
      <div className="flex flex-col items-center gap-4 flex-1">
        <span className="text-[10px] font-black uppercase tracking-[0.25em] opacity-30">
          {t("common.securePayments")}
        </span>
        <img
          src="/payments.png"
          alt="Visa, Mastercard, Mir"
          className={`h-10 md:h-12 w-auto object-contain transition-all duration-500 ${
            isDark ? "brightness-200 grayscale opacity-60 hover:opacity-100 hover:grayscale-0" : "opacity-90 hover:opacity-100"
          }`}
        />
      </div>

      {/* 3. NAVIGATION & GUIDES */}
      <div className="flex flex-wrap justify-center gap-x-6 md:gap-x-8 gap-y-3 flex-1">
        <Link
          to="/guides"
          className="text-[11px] font-black uppercase tracking-[0.2em] text-behance-blue hover:underline pb-1"
        >
          📚 {t("footer.guides") || "Гайды и SEO"}
        </Link>
        <LegalLink label={t("footer.legal.offer")} view="terms" />
        <LegalLink label={t("footer.legal.privacy")} view="privacy" />
        <LegalLink label={t("footer.legal.refund")} view="refund" />
      </div>

      {/* 4. SUPPORT */}
      <div className="flex flex-col items-center xl:items-end gap-2 flex-1 text-center xl:text-right">
        <span className="text-[10px] font-black uppercase tracking-[0.25em] opacity-30">
          {t("common.support")}
        </span>
        <a
          href="mailto:dom.craft.digital@gmail.com"
          className="text-xs md:text-[13px] font-black uppercase tracking-widest text-behance-blue hover:text-blue-400 transition-colors border-b-2 border-behance-blue/10 hover:border-behance-blue"
        >
          dom.craft.digital@gmail.com
        </a>
      </div>
    </footer>
  );
};
