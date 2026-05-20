import api from './api';

export interface Professional {
  id: string;
  identifier?: string;
  full_name: string;
  image_url: string | null;
  description: string | null;
  email: string;
  specialty: string;
  created_at: string;
  updated_at: string;
}

export interface ProfessionalListResponse {
  data: Professional[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateProfessionalPayload {
  full_name: string;
  email: string;
  password?: string;
  specialty: string;
  identifier?: string;
  image_url?: string;
  description?: string;
}

export interface DashboardData {
  total_scales: number;
  total_evaluations: number;
  total_linked_clients: number;
}

export const professionalApi = {
  list: async (params: { page?: number; limit?: number; name?: string; identifier?: string; specialty?: string } = {}) => {
    const { data } = await api.get<ProfessionalListResponse>('/professionals', { params });
    return data;
  },

  create: async (payload: CreateProfessionalPayload) => {
    const { data } = await api.post<Professional>('/professionals', payload);
    return data;
  },

  delete: async (id: string) => {
    await api.delete(`/professionals/${id}`);
  },

  getDashboard: async (): Promise<DashboardData> => {
    const { data } = await api.get<DashboardData>('/professionals/dashboard');
    return data;
  },
};
