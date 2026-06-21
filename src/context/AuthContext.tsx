import React, { useState } from "react";
import type { AuthCredentials } from "../types/auth.types";
import { authService } from "../api/auth.service";
import { AuthContext } from "./AuthContextInstance";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem("token");
  });

  // Добавляем стейт для хранения ID пользователя (строка или null)
  const [user, setUser] = useState<string | null>(() => {
    return localStorage.getItem("userId");
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (data: AuthCredentials) => {
    setIsLoading(true);
    try {
      const res = await authService.login(data);

      // Предполагаем, что бэкенд возвращает { access_token: "...", userId: "..." }
      // или id внутри объекта user, например: res.userId или res.user.id
      // Подправь свойство в зависимости от ответа твоего NestJS контроллера!
      const fetchedUserId = res.user;

      if (fetchedUserId) {
        localStorage.setItem("userId", fetchedUserId);
        setUser(fetchedUserId);
      }

      localStorage.setItem("token", res.access_token);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: AuthCredentials) => {
    setIsLoading(true);
    try {
      const res = await authService.register(data);

      // Точно так же вытаскиваем userId при регистрации
      const fetchedUserId = res.userId || res.user?.id;

      if (fetchedUserId) {
        localStorage.setItem("userId", fetchedUserId);
        setUser(fetchedUserId);
      }

      localStorage.setItem("token", res.access_token);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem("userId"); // Очищаем id при выходе
    setUser(null);
    setIsAuthenticated(false);
  };

  // Прокидываем `user` в value провайдера
  return <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>;
};
