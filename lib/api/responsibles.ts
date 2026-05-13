import api from './api';

export interface CreateResponsiblePayload {
  full_name: string;
  email: string;
  password: string;
  identifier?: string;
  image_url?: string;
  description?: string;
}

export const responsibleApi = {
  create: async (payload: CreateResponsiblePayload) => {
    const { data } = await api.post('/responsibles', payload);
    return data;
  },
};
