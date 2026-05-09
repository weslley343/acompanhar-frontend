import api from './api';
import { 
  Suggestion, 
  CreateSuggestionDTO, 
  RespondSuggestionDTO, 
  SuggestionListResponse 
} from '@/types/suggestion';

export const suggestionService = {
  /**
   * Create a new suggestion (Professionals and Responsibles)
   */
  async createSuggestion(data: CreateSuggestionDTO): Promise<Suggestion> {
    const response = await api.post<Suggestion>('/suggestions', data);
    return response.data;
  },

  /**
   * List all suggestions (Authenticated users)
   */
  async getSuggestions(page = 1, limit = 10): Promise<SuggestionListResponse> {
    const response = await api.get<SuggestionListResponse>('/suggestions', {
      params: { page, limit }
    });
    return response.data;
  },

  /**
   * List suggestions created by the logged in user
   */
  async getMySuggestions(): Promise<Suggestion[]> {
    const response = await api.get<Suggestion[]>('/suggestions/me');
    return response.data;
  },

  /**
   * Delete a suggestion (Owner or Admin)
   */
  async deleteSuggestion(id: number): Promise<void> {
    await api.delete(`/suggestions/${id}`);
  },

  /**
   * Respond to a suggestion (Admin only)
   */
  async respondToSuggestion(id: number, data: RespondSuggestionDTO): Promise<Suggestion> {
    const response = await api.patch<Suggestion>(`/suggestions/${id}/respond`, data);
    return response.data;
  }
};
