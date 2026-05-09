// types/suggestion.ts

export type SuggestionStatus = 'pending' | 'responded';

export interface Suggestion {
  id: number;
  content: string;
  response: string | null;
  status: SuggestionStatus;
  professional_fk: string | null;
  responsible_fk: string | null;
  admin_fk: number | null;
  created_at: string;
  updated_at: string;
  
  // Relations (optional for listing)
  professionals?: {
    full_name: string;
  };
  responsibles?: {
    full_name: string;
  };
  admins?: {
    name: string;
  };
}

export interface CreateSuggestionDTO {
  content: string;
}

export interface RespondSuggestionDTO {
  response: string;
}

export interface SuggestionListResponse {
  data: Suggestion[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  };
}
