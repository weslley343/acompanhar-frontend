export interface DemoCredentials {
  email: string;
  password?: string;
  identifier: string;
}

export interface DemoSummaryItem {
  scale: string;
  child: string;
}

export interface DemoResponse {
  message: string;
  credentials: {
    professional: DemoCredentials;
    responsible: DemoCredentials;
  };
  summary: DemoSummaryItem[];
}
