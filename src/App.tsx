import React, { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { AuthForm } from "./components/AuthForm";
import { useAuth } from "./hooks/useAuth";
import { Dashboard } from "./pages/Dashboard";
import { Plans } from "./pages/Plans";
import { PrivacyPage } from "./pages/PrivacyPage";
import { OfferPage } from "./pages/OfferPage";
import { RefundPage } from "./pages/RefundPage";
import { HelpPage } from "./pages/HelpPage"; // Наша новая страница

// Все возможные экраны приложения
type View = "dashboard" | "plans" | "terms" | "privacy" | "refund" | "help";

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [currentView, setCurrentView] = useState<View>("dashboard");

  const handleNavigate = (view: View) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-behance-grayBg dark:bg-behance-darkBg">
        <div className="w-6 h-6 rounded-full border-2 border-behance-blue border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // --- ПУБЛИЧНЫЕ СТРАНИЦЫ (Доступны без логина) ---
  if (!isAuthenticated) {
    if (currentView === "privacy") return <PrivacyPage onBack={() => handleNavigate("dashboard")} />;
    if (currentView === "terms") return <OfferPage onBack={() => handleNavigate("dashboard")} />;
    if (currentView === "refund") return <RefundPage onBack={() => handleNavigate("dashboard")} />;
    if (currentView === "help") return <HelpPage onBack={() => handleNavigate("dashboard")} />;

    return <AuthForm onNavigatePrivacy={() => handleNavigate("privacy")} onNavigateTerms={() => handleNavigate("terms")} />;
  }

  // --- СТРАНИЦЫ ДЛЯ АВТОРИЗОВАННЫХ ---
  return (
    <div className="min-h-screen bg-behance-grayBg dark:bg-behance-darkBg">
      {currentView === "dashboard" && (
        <Dashboard
          onNavigatePricing={() => handleNavigate("plans")}
          onNavigateLegal={handleNavigate} // Теперь handleNavigate принимает все View
          logout={logout}
        />
      )}

      {currentView === "plans" && <Plans onBack={() => handleNavigate("dashboard")} onNavigateLegal={handleNavigate} />}
      {currentView === "privacy" && <PrivacyPage onBack={() => handleNavigate("dashboard")} />}
      {currentView === "terms" && <OfferPage onBack={() => handleNavigate("dashboard")} />}
      {currentView === "refund" && <RefundPage onBack={() => handleNavigate("dashboard")} />}
      {currentView === "help" && <HelpPage onBack={() => handleNavigate("dashboard")} />}
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
