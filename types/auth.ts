export type UserRole = 'professional' | 'responsible' | 'admin';

export interface User {
  id: string;
  identifier?: string; // Administradores não possuem identifier
  full_name: string;   // Campo padronizado (será preenchido por 'name' no caso de admins)
  image_url: string | null;
  description: string | null;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user?: User;
}

export interface RefreshResponse {
  token: string;
}

export interface AuthCredentials {
  email: string;
  password?: string;
}
