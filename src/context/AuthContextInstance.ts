import { createContext } from "react";
import type { AuthCredentials } from "../types/auth.types";

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: string | null;
  login: (data: AuthCredentials) => Promise<void>;
  register: (data: AuthCredentials) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
