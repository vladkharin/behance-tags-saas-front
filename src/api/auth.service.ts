import api from "./axios";
// Добавляем слово type перед импортируемыми интерфейсами:
import type { AuthCredentials, AuthResponse } from "../types/auth.types";

export const authService = {
  async register(data: AuthCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  async login(data: AuthCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  logout() {
    localStorage.removeItem("token");
  },
};
