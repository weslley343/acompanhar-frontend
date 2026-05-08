import api from './api';
import { ClientListResponse, CreateClientDTO, Client } from '@/types/client';
import { UserRole } from '@/types/auth';

export const clientService = {
  async getClients(role: UserRole, page: number = 1, limit: number = 10): Promise<ClientListResponse> {
    const endpoint = role === 'responsible' ? '/relations/responsibles/' : '/relations/professionals/';
    
    const response = await api.get<ClientListResponse>(endpoint, {
      params: {
        page,
        limit,
      },
    });
    
    return response.data;
  },

  async linkClient(identifier: string, code: string): Promise<any> {
    const response = await api.post('/relations/clients/', {
      identifier,
      code,
    });
    return response.data;
  },
  async createClient(data: CreateClientDTO): Promise<Client> {
    const response = await api.post<Client>('/clients/', data);
    return response.data;
  },
  async getClientById(id: string): Promise<Client> {
    const response = await api.get<Client>(`/clients/${id}`);
    return response.data;
  },
};
