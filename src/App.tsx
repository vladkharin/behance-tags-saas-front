import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { AuthForm } from "./components/AuthForm";
import { useAuth } from "./hooks/useAuth";
import { Dashboard } from "./pages/Dashboard";

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-behance-grayBg">
        <div className="w-6 h-6 rounded-full border-2 border-behance-blue border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Если не авторизован — показываем форму входа/регистрации
  if (!isAuthenticated) {
    return <AuthForm />;
  }

  // Если авторизован — рендерим панель управления
  return (
    <div className="min-h-screen bg-behance-grayBg text-behance-black">
      {/* Навигационная панель в стиле Behance */}
      <nav className="bg-white border-b border-behance-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-black uppercase tracking-wider text-behance-blue">
              Behance Tags <span className="text-behance-black">SaaS</span>
            </span>
          </div>
          <button
            onClick={logout}
            className="text-xs font-semibold text-behance-muted hover:text-behance-black border border-behance-border bg-white px-4 py-2 rounded-xl transition-all cursor-pointer hover:shadow-sm"
          >
            Выйти из аккаунта
          </button>
        </div>
      </nav>

      {/* Контент нашего дашборда (там как раз инпут для ссылки на конкретный кейс) */}
      <main>
        <Dashboard />
      </main>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
