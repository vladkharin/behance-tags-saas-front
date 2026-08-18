import api from "./axios";
import type {
  AuthCredentials,
  AuthResponse,
  RegisterResponse,
  VerifyCodeCredentials,
} from "../types/auth.types";

export const authService = {
  async register(data: AuthCredentials): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>("/auth/register", data);
    return response.data;
  },

  async login(data: AuthCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  async verifyCode(data: VerifyCodeCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/verify-code", data);
    return response.data;
  },

  async resendCode(email: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>("/auth/resend-code", { email });
    return response.data;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("isAdmin");
  },
};
