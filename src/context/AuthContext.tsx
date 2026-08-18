import React, { useState, useEffect, useCallback } from "react";
import type { AuthCredentials, AuthResponse, UserProfile } from "../types/auth.types";
import { authService } from "../api/auth.service";
import api from "../api/axios";
import { AuthContext } from "./AuthContextInstance";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem("token");
  });

  const [user, setUser] = useState<string | null>(() => {
    return localStorage.getItem("userId");
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem("isAdmin") === "true";
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const logout = useCallback(() => {
    authService.logout();
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    setUser(null);
    setIsAdmin(false);
    setIsAuthenticated(false);
  }, []);

  // Проверка профиля и прав администратора на бэкенде
  const verifyProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await api.get<UserProfile>("/auth/me");
      const adminStatus = !!res.data.isAdmin;
      setIsAdmin(adminStatus);
      localStorage.setItem("isAdmin", String(adminStatus));
    } catch {
      // Игнорируем ошибки фоновой проверки
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      verifyProfile();
    }
  }, [isAuthenticated, verifyProfile]);

  // Слушаем событие разлогина из axios interceptor (401)
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [logout]);

  const handleAuthResponse = (res: AuthResponse) => {
    const fetchedUserId = res.user;
    const token = res.access_token;
    const adminStatus = !!res.isAdmin;

    if (fetchedUserId) {
      localStorage.setItem("userId", fetchedUserId);
      setUser(fetchedUserId);
    }

    if (token) {
      localStorage.setItem("token", token);
      setIsAuthenticated(true);
    }

    setIsAdmin(adminStatus);
    localStorage.setItem("isAdmin", String(adminStatus));
  };

  const login = async (data: AuthCredentials) => {
    setIsLoading(true);
    try {
      const res = await authService.login(data);
      handleAuthResponse(res);
      await verifyProfile();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: AuthCredentials): Promise<RegisterResponse> => {
    setIsLoading(true);
    try {
      const res = await authService.register(data);
      if (res.access_token) {
        handleAuthResponse(res as AuthResponse);
        await verifyProfile();
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async (data: VerifyCodeCredentials) => {
    setIsLoading(true);
    try {
      const res = await authService.verifyCode(data);
      handleAuthResponse(res);
      await verifyProfile();
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async (email: string) => {
    return await authService.resendCode(email);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isAdmin,
        isLoading,
        login,
        register,
        verifyCode,
        resendCode,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

