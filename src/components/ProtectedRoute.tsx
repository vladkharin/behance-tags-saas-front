import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  // Пока проверяется токен (например, идет валидация при перезагрузке), показываем минималистичный спиннер
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-behance-grayBg">
        <div className="w-6 h-6 rounded-full border-2 border-behance-blue border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Если не авторизован — отправляем на страницу входа
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
