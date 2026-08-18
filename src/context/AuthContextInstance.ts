import { createContext } from "react";
import type { AuthCredentials, RegisterResponse, VerifyCodeCredentials } from "../types/auth.types";

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: string | null;
  isAdmin: boolean;
  login: (data: AuthCredentials) => Promise<void>;
  register: (data: AuthCredentials) => Promise<RegisterResponse>;
  verifyCode: (data: VerifyCodeCredentials) => Promise<void>;
  resendCode: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
