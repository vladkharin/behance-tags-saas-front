import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContextInstance";
import { useTranslation } from "react-i18next";
import type { AuthCredentials } from "../types/auth.types";

interface AuthFormProps {
  onNavigatePrivacy: () => void;
  onNavigateTerms: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onNavigatePrivacy, onNavigateTerms }) => {
  const { login, register, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isAgreed, setIsAgreed] = useState(false);

  const isDark = theme === "dark";

  const toggleLanguage = () => {
    const newLang = i18n.language === "ru" ? "en" : "ru";
    i18n.changeLanguage(newLang);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError(t("auth.errorEmpty"));
      return;
    }

    if (!isLoginMode && !isAgreed) {
      setError(t("auth.errorAgreement"));
      return;
    }

    const credentials: AuthCredentials = { email, password };

    try {
      if (isLoginMode) {
        await login(credentials);
      } else {
        await register(credentials);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === "object" && err !== null && "message" in err) {
        setError(String((err as { message: unknown }).message));
      } else {
        setError("Error");
      }
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-behance-grayBg dark:bg-behance-darkBg px-4 transition-colors duration-500">
      {/* ПЕРЕКЛЮЧАТЕЛЬ ЯЗЫКА */}
      <button
        onClick={toggleLanguage}
        type="button"
        className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white dark:bg-behance-darkCard border border-behance-border dark:border-white/10 shadow-sm transition-all hover:scale-110 active:scale-95 z-50 text-[10px] font-black uppercase text-behance-muted dark:text-blue-400"
      >
        {i18n.language.toUpperCase().substring(0, 2)}
      </button>

      {/* ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ */}
      <button
        onClick={toggleTheme}
        type="button"
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white dark:bg-behance-darkCard border border-behance-border dark:border-white/10 shadow-sm transition-all hover:scale-110 active:scale-95 z-50"
      >
        <span className="text-lg leading-none">{isDark ? "☀️" : "🌙"}</span>
      </button>

      <div className="w-full max-w-[400px] bg-white dark:bg-behance-darkCard border border-behance-border dark:border-white/5 rounded-xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] dark:shadow-2xl transition-colors duration-500">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-behance-black dark:text-white transition-colors">
            {isLoginMode ? t("auth.loginTitle") : t("auth.registerTitle")}
          </h2>
          <p className="text-sm text-behance-muted dark:text-gray-400 mt-2 transition-colors">{t("auth.subtitle")}</p>
        </div>

        {error && (
          <div className="mb-5 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-lg text-center animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-behance-muted dark:text-gray-500 mb-2">
              {t("auth.emailLabel")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-behance-border dark:border-white/10 rounded-lg text-sm text-behance-black dark:text-white placeholder-gray-400 focus:outline-none focus:border-behance-blue disabled:opacity-60 transition-all"
              placeholder="example@domain.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-behance-muted dark:text-gray-500 mb-2">
              {t("auth.passwordLabel")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-behance-border dark:border-white/10 rounded-lg text-sm text-behance-black dark:text-white placeholder-gray-400 focus:outline-none focus:border-behance-blue disabled:opacity-60 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Согласие с документами: Кнопки теперь выглядят как синие ссылки */}
          {!isLoginMode && (
            <div className="flex items-start gap-3 mt-4 text-left">
              <input
                id="agreement"
                type="checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                disabled={isLoading}
                className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-gray-700 bg-transparent text-behance-blue focus:ring-behance-blue transition-colors cursor-pointer"
                required
              />
              <label htmlFor="agreement" className="text-[11px] leading-relaxed text-behance-muted dark:text-gray-400 select-none">
                {t("auth.agreementPrefix")}{" "}
                <button type="button" onClick={onNavigateTerms} className="text-behance-blue hover:underline font-medium transition-all">
                  {t("auth.agreementOffer")}
                </button>
                {t("auth.agreementAnd")} {t("auth.agreementConsent")}{" "}
                <button type="button" onClick={onNavigatePrivacy} className="text-behance-blue hover:underline font-medium transition-all">
                  {t("auth.agreementPrivacy")}
                </button>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || (!isLoginMode && !isAgreed)}
            className="w-full py-3 bg-behance-blue hover:bg-behance-darkBlue text-white font-medium text-sm rounded-full transition-all duration-200 mt-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 active:scale-[0.98]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {t("auth.loading")}
              </span>
            ) : isLoginMode ? (
              t("auth.loginBtn")
            ) : (
              t("auth.registerBtn")
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setError(null);
              setIsAgreed(false);
            }}
            className="text-sm text-behance-blue hover:underline font-medium disabled:opacity-50 transition-colors"
          >
            {isLoginMode ? t("auth.noAccount") : t("auth.hasAccount")}
          </button>
        </div>
      </div>
    </div>
  );
};
