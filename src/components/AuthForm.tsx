import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContextInstance"; // Импорт из правильного файла
import type { AuthCredentials } from "../types/auth.types";

export const AuthForm: React.FC = () => {
  const { login, register, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme(); // Достаем тему и функцию переключения

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [isAgreed, setIsAgreed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Пожалуйста, заполните все поля");
      return;
    }

    if (!isLoginMode && !isAgreed) {
      setError("Необходимо согласиться с условиями использования сервиса");
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
        setError("Произошла непредвиденная ошибка при аутентификации");
      }
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-behance-grayBg dark:bg-behance-darkBg px-4 transition-colors duration-500">
      {/* КНОПКА ПЕРЕКЛЮЧЕНИЯ ТЕМЫ */}
      <button
        onClick={toggleTheme}
        type="button"
        className="absolute top-6 right-6 p-3 rounded-full bg-white dark:bg-behance-darkCard border border-behance-border dark:border-white/10 shadow-sm transition-all hover:scale-110 active:scale-95 z-50"
      >
        <span className="text-lg leading-none">{theme === "light" ? "🌙" : "☀️"}</span>
      </button>

      {/* КАРТОЧКА ФОРМЫ */}
      <div className="w-full max-w-[400px] bg-white dark:bg-behance-darkCard border border-behance-border dark:border-white/5 rounded-xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] dark:shadow-2xl transition-colors duration-500">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-behance-black dark:text-white transition-colors">
            {isLoginMode ? "Войти в BeRanked" : "Создать аккаунт"}
          </h2>
          <p className="text-sm text-behance-muted dark:text-gray-400 mt-2 transition-colors">Аналитика тегов для создателей</p>
        </div>

        {/* Ошибки */}
        {error && (
          <div className="mb-5 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-lg text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-behance-muted dark:text-gray-500 mb-2">Email</label>
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
              Пароль
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

          {/* Согласие с документами (только при регистрации) */}
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
                Регистрируясь в BeRanked, я принимаю условия{" "}
                <a href="/terms.html" target="_blank" rel="noopener noreferrer" className="text-behance-blue hover:underline font-medium">
                  Публичной оферты
                </a>
                , даю согласие на обработку данных согласно{" "}
                <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="text-behance-blue hover:underline font-medium">
                  Политике конфиденциальности
                </a>
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
                Загрузка...
              </span>
            ) : isLoginMode ? (
              "Войти"
            ) : (
              "Зарегистрироваться"
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
            {isLoginMode ? "Еще нет аккаунта? Создать" : "Уже есть аккаунт? Войти"}
          </button>
        </div>
      </div>
    </div>
  );
};
