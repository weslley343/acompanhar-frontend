// types/scale.ts
export interface Item {
  id: number;
  item_order: number;
  content: string;
  score: number | string; // Decimal from DB might come as string
  question_fk: number;
  created_at?: string;
}

export interface Question {
  id: number;
  item_order: number;
  content: string;
  scale_fk: number;
  domain: string;
  color?: string;
  created_at?: string;
  itens: Item[];
}

export interface Scale {
  id: number;
  name: string;
  image_url: string | null;
  description: string;
  color: string | null;
  created_at?: string;
  questions?: Question[];
}
