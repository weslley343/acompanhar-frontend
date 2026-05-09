// types/evaluation.ts
export interface AnswerDTO {
  question_fk: number;
  item_fk: number;
}

export interface CreateEvaluationDTO {
  title: string;
  notes?: string;
  client_fk: string;
  scale_fk: number;
  answers: AnswerDTO[];
  metadata?: any;
}

export interface EvaluationResponse {
  id: number;
  title: string;
  notes?: string;
  client_fk: string;
  professional_fk: string;
  scale_fk: number;
  created_at: string;
  scales?: {
    name: string;
  };
  professionals?: {
    full_name: string;
  };
  metadata?: {
    scores: Record<string, number>;
    total_score: number;
    observations?: string;
  };
  answers?: Array<{
    id: number;
    question_fk: number;
    item_fk: number;
    questions: {
      id: number;
      content: string;
      domain: string;
    };
    itens: {
      id: number;
      content: string;
      score: number;
    };
  }>;
}
