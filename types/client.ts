import { UserRole } from "./auth";

export interface Client {
  id: string;
  image_url: string | null;
  identifier: string;
  code: string | null;
  full_name: string;
  birthdate: string;
  gender: 'male' | 'female' | 'unspecified';
  description: string | null;
  creator_fk: string | null;
  created_at: string;
}

export interface ClientRelation {
  id: string;
  client_fk: string;
  professional_fk?: string;
  responsible_fk?: string;
  archived: boolean;
  created_at: string;
  clients: Client;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ClientListResponse {
  data: ClientRelation[];
  meta: PaginationMeta;
}

export interface CreateClientDTO {
  identifier?: string;
  full_name: string;
  birthdate: string;
  gender: 'male' | 'female' | 'unspecified';
  description?: string;
  image_url?: string;
}
