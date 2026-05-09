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
  }
};
