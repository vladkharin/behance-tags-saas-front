export interface AuthCredentials {
  email: string;
  password?: string; // сделаем опциональным, если в будущем добавится OAuth
}

export interface AuthResponse {
  access_token: string;
  user: string;
}
