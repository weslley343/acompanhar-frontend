import api from './api';
import { CreateEvaluationDTO, EvaluationResponse } from '@/types/evaluation';

export const evaluationService = {
  async createEvaluation(data: CreateEvaluationDTO): Promise<EvaluationResponse> {
    const response = await api.post<EvaluationResponse>('/evaluations', data);
    return response.data;
  },

  async getEvaluationsByClient(clientId: string, scaleName?: string, page = 1, limit = 10): Promise<{ data: EvaluationResponse[], meta: any }> {
    const params: any = { page, limit };
    if (scaleName) params.scaleName = scaleName;
    
    const response = await api.get<{ data: EvaluationResponse[], meta: any }>(`/evaluations/client/${clientId}`, { params });
    return response.data;
  },

  async deleteEvaluation(id: number): Promise<void> {
    await api.delete(`/evaluations/${id}`);
  },

  async getEvaluationById(id: number): Promise<EvaluationResponse> {
    const response = await api.get<EvaluationResponse>(`/evaluations/${id}`);
    return response.data;
  }
};
