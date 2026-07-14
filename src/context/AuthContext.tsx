import React, { useState } from "react";
import type { AuthCredentials } from "../types/auth.types";
import { authService } from "../api/auth.service";
import { AuthContext } from "./AuthContextInstance";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem("token");
  });

  const [user, setUser] = useState<string | null>(() => {
    return localStorage.getItem("userId");
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Вспомогательная функция для обработки ответа (логин/регистрация)
  const handleAuthResponse = (res: any) => {
    // 1. Пытаемся достать данные. Если res.data существует — берем его, если нет — берем сам res.
    const data = res.data || res;

    console.log("DEBUG: Полный ответ сервера:", res);
    console.log("DEBUG: Извлеченные данные:", data);

    // 2. Проверяем все возможные варианты ключей (user, userId, id)
    const fetchedUserId = data.user || data.userId || data.id;
    const token = data.access_token || data.token;

    console.log("DEBUG: Попытка найти userId:", fetchedUserId);

    if (fetchedUserId) {
      localStorage.setItem("userId", fetchedUserId);
      setUser(fetchedUserId);
      console.log("DEBUG: Успешно записано в localStorage");
    } else {
      console.error("DEBUG: ОШИБКА! userId не найден. Проверьте структуру JSON в Network.");
    }

    if (token) {
      localStorage.setItem("token", token);
      setIsAuthenticated(true);
    }
  };

  const login = async (data: AuthCredentials) => {
    setIsLoading(true);
    try {
      const res = await authService.login(data);
      handleAuthResponse(res); // Используем общую логику
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: AuthCredentials) => {
    console.log("ВЕРСИЯ КОДА: 2.0 (ПОСЛЕ ФИКСА ID)");
    setIsLoading(true);
    try {
      const res = await authService.register(data);
      handleAuthResponse(res); // Теперь и здесь ID подхватится правильно
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  };

  return <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>;
};
