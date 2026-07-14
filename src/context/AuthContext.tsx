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
    // Твой бэкенд присылает ID в поле "user"
    const fetchedUserId = res.user;
    const token = res.access_token;

    if (fetchedUserId) {
      localStorage.setItem("userId", fetchedUserId);
      setUser(fetchedUserId);
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
