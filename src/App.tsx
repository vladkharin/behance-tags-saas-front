import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ToastContainer } from "./components/ui/ToastContainer";
import { ConfirmModal } from "./components/ui/ConfirmModal";
import { AuthForm } from "./components/AuthForm";
import { useAuth } from "./hooks/useAuth";
import { Dashboard } from "./pages/Dashboard";
import { Plans } from "./pages/Plans";
import { PrivacyPage } from "./pages/PrivacyPage";
import { OfferPage } from "./pages/OfferPage";
import { RefundPage } from "./pages/RefundPage";
import { HelpPage } from "./pages/HelpPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";

const AuthRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthForm
      onNavigatePrivacy={() => navigate("/privacy")}
      onNavigateTerms={() => navigate("/terms")}
    />
  );
};

const MainApp: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-behance-grayBg dark:bg-behance-darkBg">
      <Routes>
        {/* Публичный роут авторизации */}
        <Route path="/auth" element={<AuthRoute />} />

        {/* Публичные страницы (доступны всем) */}
        <Route path="/help" element={<HelpPage onBack={() => navigate("/")} />} />
        <Route path="/privacy" element={<PrivacyPage onBack={() => navigate("/")} />} />
        <Route path="/terms" element={<OfferPage onBack={() => navigate("/")} />} />
        <Route path="/refund" element={<RefundPage onBack={() => navigate("/")} />} />

        {/* Закрытые роуты для авторизованных пользователей */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={
              <Dashboard
                onNavigatePricing={() => navigate("/plans")}
                onNavigateLegal={(view) => navigate(`/${view}`)}
                onNavigateAdmin={() => navigate("/admin")}
                logout={logout}
              />
            }
          />
          <Route
            path="/plans"
            element={
              <Plans
                onBack={() => navigate("/")}
                onNavigateLegal={(view) => navigate(`/${view}`)}
              />
            }
          />
        </Route>

        {/* Закрытый роут только для администратора */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route
            path="/admin"
            element={<AdminDashboard onBackToApp={() => navigate("/")} />}
          />
        </Route>

        {/* Дефолтный редирект */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <MainApp />
          <ToastContainer />
          <ConfirmModal />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
