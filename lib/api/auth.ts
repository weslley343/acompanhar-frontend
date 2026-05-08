import api from './api';
import { AuthCredentials, LoginResponse, User, UserRole } from '@/types/auth';

export const authApi = {
  /**
   * Performs login based on user role
   */
  login: async (credentials: AuthCredentials, role: UserRole): Promise<LoginResponse> => {
    const loginUrl = role === 'professional' 
      ? '/auth/professional/login/' 
      : role === 'responsible'
        ? '/auth/responsible/login/'
        : '/auth/login/'; // admin login

    const { data } = await api.post<LoginResponse>(loginUrl, credentials);
    return data;
  },

  /**
   * Fetches the current authenticated user profile
   */
  getMe: async (token?: string): Promise<User> => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const { data } = await api.get<any>('/auth/me/', config);
    
    // Normalização: Admins usam 'name', outros 'full_name'.
    // Padronizamos tudo para 'full_name' no frontend.
    const normalizedUser: User = {
      ...data,
      full_name: data.full_name || data.name || 'Usuário',
      image_url: data.image_url || null,
      description: data.description || null,
    };
    
    return normalizedUser;
  },

  /**
   * Refreshes the access token using a refresh token
   */
  refresh: async (refreshToken: string): Promise<{ token: string }> => {
    const { data } = await api.post<{ token: string }>('/auth/refresh/', { refreshToken });
    return data;
  }
};
