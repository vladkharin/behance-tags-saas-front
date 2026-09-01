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
import { LandingPage } from "./pages/LandingPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { OfferPage } from "./pages/OfferPage";
import { RefundPage } from "./pages/RefundPage";
import { HelpPage } from "./pages/HelpPage";
import { GuidesListPage } from "./pages/GuidesListPage";
import { GuideDetailPage } from "./pages/GuideDetailPage";
import { TagsCatalogPage } from "./pages/TagsCatalogPage";
import { NicheTagDetailPage } from "./pages/NicheTagDetailPage";
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

const RootRoute: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return (
      <Dashboard
        onNavigatePricing={() => navigate("/plans")}
        onNavigateLegal={(view) => navigate(`/${view}`)}
        onNavigateAdmin={() => navigate("/admin")}
        onNavigateAuth={() => navigate("/auth")}
        logout={logout}
      />
    );
  }

  return (
    <LandingPage
      onNavigateAuth={() => navigate("/auth")}
      onTryDemo={() => navigate("/demo")}
      onNavigatePlans={() => navigate("/plans")}
      onNavigateLegal={(view) => navigate(`/${view}`)}
    />
  );
};

const MainApp: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-behance-grayBg dark:bg-behance-darkBg">
      <Routes>
        {/* Главный роут: Лендинг для гостей, Dashboard для авторизованных */}
        <Route path="/" element={<RootRoute />} />

        {/* Публичный роут авторизации */}
        <Route path="/auth" element={<AuthRoute />} />

        {/* Интерактивное демо (доступно без обязательной авторизации) */}
        <Route
          path="/demo"
          element={
            <Dashboard
              onNavigatePricing={() => navigate("/plans")}
              onNavigateLegal={(view) => navigate(`/${view}`)}
              onNavigateAuth={() => navigate("/auth")}
              logout={() => navigate("/auth")}
              initialDemo={true}
            />
          }
        />

        {/* SEO Блог и база знаний */}
        <Route path="/guides" element={<GuidesListPage />} />
        <Route path="/guides/:slug" element={<GuideDetailPage />} />

        {/* Каталог проверенных тегов по нишам (Programmatic SEO) */}
        <Route path="/tags" element={<TagsCatalogPage />} />
        <Route path="/tags/:slug" element={<NicheTagDetailPage />} />

        {/* Публичные страницы (доступны всем) */}
        <Route
          path="/plans"
          element={
            <Plans
              onBack={() => navigate("/")}
              onNavigateLegal={(view) => navigate(`/${view}`)}
            />
          }
        />
        <Route path="/help" element={<HelpPage onBack={() => navigate("/")} />} />
        <Route path="/privacy" element={<PrivacyPage onBack={() => navigate("/")} />} />
        <Route path="/terms" element={<OfferPage onBack={() => navigate("/")} />} />
        <Route path="/refund" element={<RefundPage onBack={() => navigate("/")} />} />

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
