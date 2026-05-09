import api from './api';
import { ClientListResponse, CreateClientDTO, UpdateClientDTO, Client, ResponsibleListResponse, ProfessionalListResponse } from '@/types/client';
import { UserRole } from '@/types/auth';

export const clientService = {
  async getClients(role: UserRole, page: number = 1, limit: number = 10, search?: string, gender?: string): Promise<ClientListResponse> {
    const endpoint = role === 'responsible' ? '/relations/responsibles' : '/relations/professionals';
    
    const response = await api.get<ClientListResponse>(endpoint, {
      params: {
        page,
        limit,
        search,
        gender
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
  async updateClient(id: string, data: UpdateClientDTO): Promise<Client> {
    const response = await api.patch<Client>(`/clients/${id}`, data);
    return response.data;
  },
  async deleteClient(id: string): Promise<void> {
    await api.delete(`/clients/${id}`);
  },
  async getClientResponsibles(id: string): Promise<ResponsibleListResponse> {
    const response = await api.get<ResponsibleListResponse>(`/clients/${id}/responsibles`);
    return response.data;
  },
  async getClientProfessionals(id: string): Promise<ProfessionalListResponse> {
    const response = await api.get<ProfessionalListResponse>(`/clients/${id}/professionals`);
    return response.data;
  },
  async unlinkClient(role: UserRole, relationId: string): Promise<void> {
    const endpoint = role === 'responsible' ? `/relations/responsible/${relationId}` : `/relations/professional/${relationId}`;
    await api.delete(endpoint);
  },
};
