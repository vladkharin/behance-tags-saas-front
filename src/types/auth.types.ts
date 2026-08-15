export interface AuthCredentials {
  email: string;
  password?: string;
  name?: string;
}

export interface AuthResponse {
  access_token: string;
  user: string;
  isAdmin?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string | null;
  plan?: string;
  tagBalance?: number;
  isAdmin?: boolean;
}
