import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContextInstance";
import { useTranslation } from "react-i18next";
import { useToast } from "../context/ToastContext";
import { fireConfetti } from "../utils/confetti";
import type { AuthCredentials } from "../types/auth.types";

interface AuthFormProps {
  onNavigatePrivacy: () => void;
  onNavigateTerms: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onNavigatePrivacy, onNavigateTerms }) => {
  const { login, register, verifyCode, resendCode, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isAgreed, setIsAgreed] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  const otpInputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === "dark";

  const toggleLanguage = () => {
    const newLang = i18n.language === "ru" ? "en" : "ru";
    i18n.changeLanguage(newLang);
  };

  // Таймер обратного отсчета для повторной отправки кода
  useEffect(() => {
    if (!isVerificationStep || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isVerificationStep, countdown]);

  // Фокус на инпут кода при открытии шага верификации
  useEffect(() => {
    if (isVerificationStep && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [isVerificationStep]);

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

    const credentials: AuthCredentials = { email: email.trim(), password: password.trim() };

    try {
      if (isLoginMode) {
        await login(credentials);
      } else {
        const res = await register(credentials);
        if (res?.requiresVerification) {
          setIsVerificationStep(true);
          setCountdown(60);
          setOtpCode("");
          showToast(t("auth.codeSentToast"), "info");
        }
      }
    } catch (err: unknown) {
      const axiosError = err as {
        response?: {
          status?: number;
          data?: { message?: string | string[]; error?: string; requiresVerification?: boolean };
        };
        message?: string;
      };

      // Если аккаунт существует, но почта не подтверждена
      if (
        axiosError.response?.status === 403 ||
        axiosError.response?.data?.error === "REQUIRES_VERIFICATION" ||
        axiosError.response?.data?.requiresVerification
      ) {
        setIsVerificationStep(true);
        setCountdown(60);
        setOtpCode("");
        showToast(t("auth.codeSentToast"), "info");
        return;
      }

      const serverMessage = axiosError.response?.data?.message;

      if (Array.isArray(serverMessage)) {
        setError(serverMessage.join(", "));
      } else if (typeof serverMessage === "string") {
        setError(serverMessage);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ошибка авторизации. Проверьте данные.");
      }
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = otpCode.replace(/\D/g, "").trim();
    if (cleanCode.length < 4) {
      setError("Пожалуйста, введите полный код из письма");
      return;
    }

    try {
      await verifyCode({ email: email.trim(), code: cleanCode });
      fireConfetti();
      showToast("Почта успешно подтверждена! Добро пожаловать!", "success");
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string | string[] } }; message?: string };
      const serverMessage = axiosError.response?.data?.message;

      if (Array.isArray(serverMessage)) {
        setError(serverMessage.join(", "));
      } else if (typeof serverMessage === "string") {
        setError(serverMessage);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Неверный код подтверждения");
      }
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setError(null);

    try {
      await resendCode(email.trim());
      setCountdown(60);
      showToast(t("auth.codeSentToast"), "info");
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } }; message?: string };
      setError(axiosError.response?.data?.message || "Ошибка отправки кода. Попробуйте позже.");
    } finally {
      setIsResending(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtpCode(rawVal);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-behance-grayBg dark:bg-behance-darkBg px-4 transition-colors duration-500">
      {/* LANGUAGE TOGGLE */}
      <button
        onClick={toggleLanguage}
        type="button"
        className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white dark:bg-behance-darkCard border border-behance-border dark:border-white/10 shadow-sm transition-all hover:scale-110 active:scale-95 z-50 text-[10px] font-black uppercase text-behance-muted dark:text-blue-400 cursor-pointer flex items-center justify-center"
      >
        {i18n.language.toUpperCase().substring(0, 2)}
      </button>

      {/* THEME TOGGLE */}
      <button
        onClick={toggleTheme}
        type="button"
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white dark:bg-behance-darkCard border border-behance-border dark:border-white/10 shadow-sm transition-all hover:scale-110 active:scale-95 z-50 cursor-pointer flex items-center justify-center"
      >
        <span className="text-lg leading-none">{isDark ? "☀️" : "🌙"}</span>
      </button>

      <div className="w-full max-w-[420px] bg-white dark:bg-behance-darkCard border border-behance-border dark:border-white/5 rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] dark:shadow-2xl transition-colors duration-500">
        {/* ========================================================= */}
        {/* 1. ЭКРАН ВВОДА КОДА ВЕРИФИКАЦИИ EMAIL (OTP)               */}
        {/* ========================================================= */}
        {isVerificationStep ? (
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-behance-blue flex items-center justify-center text-2xl mx-auto mb-3">
                ✉️
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-behance-black dark:text-white transition-colors">
                {t("auth.verifyTitle")}
              </h2>
              <p className="text-xs text-behance-muted dark:text-gray-400 mt-2 transition-colors leading-relaxed">
                {t("auth.verifySubtitle")}{" "}
                <span className="font-bold text-behance-black dark:text-white block mt-0.5">{email}</span>
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-xl text-center animate-in fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-behance-muted dark:text-gray-500 mb-2 text-center">
                  {t("auth.codeLabel")}
                </label>
                <div className="relative">
                  <input
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otpCode}
                    onChange={handleCodeChange}
                    disabled={isLoading}
                    className="w-full text-center tracking-[12px] font-mono text-2xl font-black py-3.5 px-4 bg-zinc-50 dark:bg-white/5 border-2 border-behance-blue/40 focus:border-behance-blue rounded-xl text-behance-black dark:text-white placeholder-gray-300 dark:placeholder-gray-700 focus:outline-none transition-all"
                    placeholder="••••••"
                    required
                  />
                </div>
                <p className="text-[10px] text-center text-zinc-400 mt-1.5">
                  Проверьте папку «Входящие» и «Спам»
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || otpCode.length < 4}
                className="w-full py-3.5 bg-behance-blue hover:bg-behance-darkBlue text-white font-bold text-sm rounded-full transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 active:scale-[0.98] cursor-pointer"
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
                ) : (
                  t("auth.verifyBtn")
                )}
              </button>
            </form>

            {/* RESEND TIMER & BUTTON */}
            <div className="mt-5 text-center space-y-2">
              {countdown > 0 ? (
                <div className="text-xs text-zinc-500 font-medium">
                  {t("auth.resendIn")}{" "}
                  <span className="font-bold text-behance-blue dark:text-blue-400 font-mono">
                    00:{countdown < 10 ? `0${countdown}` : countdown}
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isResending || isLoading}
                  onClick={handleResendOtp}
                  className="text-xs text-behance-blue hover:underline font-bold transition-colors cursor-pointer"
                >
                  {isResending ? "Отправка..." : t("auth.resendBtn")}
                </button>
              )}

              <div>
                <button
                  type="button"
                  onClick={() => {
                    setIsVerificationStep(false);
                    setError(null);
                    setOtpCode("");
                  }}
                  className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer pt-2"
                >
                  {t("auth.changeEmail")}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* 2. СТАНДАРТНАЯ ФОРМА ВХОДА ИЛИ РЕГИСТРАЦИИ                */
          /* ========================================================= */
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-behance-black dark:text-white transition-colors">
                {isLoginMode ? t("auth.loginTitle") : t("auth.registerTitle")}
              </h2>
              <p className="text-sm text-behance-muted dark:text-gray-400 mt-2 transition-colors">
                {t("auth.subtitle")}
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-xl text-center">
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
                  className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-behance-border dark:border-white/10 rounded-xl text-sm text-behance-black dark:text-white placeholder-gray-400 focus:outline-none focus:border-behance-blue disabled:opacity-60 transition-all"
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
                  className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-behance-border dark:border-white/10 rounded-xl text-sm text-behance-black dark:text-white placeholder-gray-400 focus:outline-none focus:border-behance-blue disabled:opacity-60 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* DOCUMENT CONSENT */}
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
                  <label
                    htmlFor="agreement"
                    className="text-[11px] leading-relaxed text-behance-muted dark:text-gray-400 select-none"
                  >
                    {t("auth.agreementPrefix")}{" "}
                    <button
                      type="button"
                      onClick={onNavigateTerms}
                      className="text-behance-blue hover:underline font-medium transition-all cursor-pointer"
                    >
                      {t("auth.agreementOffer")}
                    </button>
                    {t("auth.agreementAnd")}{" "}
                    <button
                      type="button"
                      onClick={onNavigatePrivacy}
                      className="text-behance-blue hover:underline font-medium transition-all cursor-pointer"
                    >
                      {t("auth.agreementPrivacy")}
                    </button>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || (!isLoginMode && !isAgreed)}
                className="w-full py-3.5 bg-behance-blue hover:bg-behance-darkBlue text-white font-medium text-sm rounded-full transition-all duration-200 mt-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 active:scale-[0.98] cursor-pointer"
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
                className="text-sm text-behance-blue hover:underline font-medium disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isLoginMode ? t("auth.noAccount") : t("auth.hasAccount")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
