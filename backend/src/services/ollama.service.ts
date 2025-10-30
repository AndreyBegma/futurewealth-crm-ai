import { ollama } from '@/config/config';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class OllamaService {
  private baseUrl: string;
  private model: string;

  constructor() {
    this.baseUrl = ollama.host;
    this.model = ollama.model;
  }

  private async chat(
    prompt: string,
    options?: {
      systemPrompt?: string;
      temperature?: number;
      maxTokens?: number;
      format?: 'json' | 'text';
      retries?: number;
    }
  ): Promise<string> {
    const retries = options?.retries ?? 3;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.model,
            messages: [
              ...(options?.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
              { role: 'user', content: prompt },
            ],
            stream: false,
            options: {
              temperature: options?.temperature ?? 0.8,
              num_predict: options?.maxTokens ?? 512,
            },
            format: options?.format === 'json' ? 'json' : undefined,
          }),
          signal: AbortSignal.timeout(60000),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data?.message?.content) {
          throw new Error('Empty response from Ollama');
        }

        return data.message.content;
      } catch (error) {
        console.error(`[Ollama] Attempt ${attempt + 1}/${retries} failed:`, error);

        if (attempt === retries - 1) {
          throw new Error('Ollama request failed after retries');
        }

        await sleep(1000 * Math.pow(2, attempt));
      }
    }

    throw new Error('Unexpected end of chat()');
  }

  async healthCheck(): Promise<string> {
    try {
      const response = await this.chat('Tell me one interesting fact as string', {
        systemPrompt: 'Something for check ai health',
        temperature: 0.3,
        maxTokens: 64,
        retries: 2,
        format: 'text',
      });

      return response;
    } catch (error) {
      console.error('Error during healthCheck:', error);

      if (error instanceof Error) {
        throw new Error(error.message);
      }

      throw new Error('AI Service failed with unknown error');
    }
  }
}

export default new OllamaService();
