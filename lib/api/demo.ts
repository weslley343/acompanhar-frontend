import api from './api';
import { DemoResponse } from '@/types/demo';

export const demoApi = {
  generateDemo: async (professionalName?: string, responsibleName?: string): Promise<DemoResponse> => {
    const { data } = await api.post<DemoResponse>('/generate-demo', {
      professionalName,
      responsibleName,
    }, { timeout: 60000 });
    return data;
  },
};
