import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from "react-router-dom";
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
import { PageMetadata } from "./components/PageMetadata";
import { NotFoundPage } from "./pages/NotFoundPage";

const AuthRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthForm
      initialMode={searchParams.get("mode") === "register" ? "register" : "login"}
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
      onNavigateAuth={(mode) => navigate(mode === "register" ? "/auth?mode=register" : "/auth")}
      onTryDemo={() => navigate("/demo")}
      onNavigatePlans={() => navigate("/plans")}
      onNavigateLegal={(view) => navigate(`/${view}`)}
    />
  );
};

export const MainApp: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-behance-grayBg dark:bg-behance-darkBg">
      <PageMetadata />
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

        <Route path="*" element={<NotFoundPage />} />
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
