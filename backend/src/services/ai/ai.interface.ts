export interface ChatOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  format?: 'json' | 'text';
  retries?: number;
}

export interface IAIProvider {
  chat<T>(prompt: string, options?: ChatOptions): Promise<string>;
  healthCheck(): Promise<string>;
}
