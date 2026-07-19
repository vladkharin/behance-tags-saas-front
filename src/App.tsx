import React, { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { AuthForm } from "./components/AuthForm";
import { useAuth } from "./hooks/useAuth";
import { Dashboard } from "./pages/Dashboard";
import { Plans } from "./pages/Plans";

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [currentView, setCurrentView] = useState<"dashboard" | "plans">("dashboard");

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-behance-grayBg dark:bg-behance-darkBg">
        <div className="w-6 h-6 rounded-full border-2 border-behance-blue border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Если не авторизован — показываем форму входа
  if (!isAuthenticated) {
    return <AuthForm />;
  }

  // Если авторизован — рендерим контент в зависимости от состояния
  return (
    <div className="min-h-screen">
      {currentView === "dashboard" ? (
        <Dashboard onNavigatePricing={() => setCurrentView("plans")} logout={logout} />
      ) : (
        <Plans onBack={() => setCurrentView("dashboard")} />
      )}
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
