import api from './api';
import { Scale } from '@/types/scale';

export const scaleService = {
  async getScales(): Promise<Scale[]> {
    const response = await api.get<Scale[]>('/scales');
    return response.data;
  },

  async getScaleById(id: number | string): Promise<Scale> {
    const response = await api.get<Scale>(`/scales/${id}`);
    return response.data;
  },

  async getClientScales(clientId: string): Promise<Scale[]> {
    const response = await api.get<{ data: Scale[] }>(`/clients/${clientId}/scales`);
    return response.data.data;
  },

  async getQuestionById(id: number | string): Promise<any> {
    const response = await api.get<any>(`/questions/${id}`);
    return response.data;
  }
};

