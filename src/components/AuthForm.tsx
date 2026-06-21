import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth"; // Импортируем из хуков
import type { AuthCredentials } from "../types/auth.types";

export const AuthForm: React.FC = () => {
  const { login, register, isLoading } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Валидация перед отправкой
    if (!email.trim() || !password.trim()) {
      setError("Пожалуйста, заполните все поля");
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
      // Безопасная обработка ошибок для TypeScript без explicit 'any'
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
    <div className="min-h-screen flex items-center justify-center bg-behance-grayBg px-4">
      <div className="w-full max-w-[400px] bg-white border border-behance-border rounded-xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        {/* Логотип / Заголовок */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-behance-black">{isLoginMode ? "Войти в ChiefTags" : "Создать аккаунт"}</h2>
          <p className="text-sm text-behance-muted mt-2">Аналитика тегов для создателей</p>
        </div>

        {/* Блок вывода ошибок */}
        {error && <div className="mb-5 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-behance-muted mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-white border border-behance-border rounded-lg text-sm text-behance-black placeholder-gray-400 focus:outline-none focus:border-behance-blue disabled:opacity-60 transition-colors"
              placeholder="example@domain.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-behance-muted mb-2">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-white border border-behance-border rounded-lg text-sm text-behance-black placeholder-gray-400 focus:outline-none focus:border-behance-blue disabled:opacity-60 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-behance-blue hover:bg-behance-darkBlue text-white font-medium text-sm rounded-full transition-colors duration-200 mt-2 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                {/* Минималистичный спиннер */}
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
              setError(null); // Сбрасываем ошибку при переключении режима
            }}
            className="text-sm text-behance-blue hover:underline font-medium disabled:opacity-50"
          >
            {isLoginMode ? "Еще нет аккаунта? Создать" : "Уже есть аккаунт? Войти"}
          </button>
        </div>
      </div>
    </div>
  );
};
