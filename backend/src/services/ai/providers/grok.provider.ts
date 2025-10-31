import { ChatOptions, IAIProvider } from '../ai.interface';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class GrokProvider implements IAIProvider {
  private baseUrl: string;
  private model: string;
  private apiKey: string;

  constructor(baseUrl: string, model: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.model = model;
    this.apiKey = apiKey;
  }

  async chat(prompt: string, options?: ChatOptions): Promise<string> {
    const retries = options?.retries ?? 3;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const url = `${this.baseUrl}/chat/completions`;
        console.log('[GrokProvider] Request URL:', url);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              ...(options?.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
              { role: 'user', content: prompt },
            ],
            temperature: options?.temperature ?? 0.8,
            max_tokens: options?.maxTokens ?? 512,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[GrokProvider] HTTP ${response.status} error:`, errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        if (!data?.choices?.[0]?.message?.content) {
          console.error('[GrokProvider] Invalid response structure:', data);
          throw new Error('Empty response from Grok');
        }

        return data.choices[0].message.content;
      } catch (error) {
        console.error(`[GrokProvider] Attempt ${attempt + 1}/${retries} failed:`, error);

        if (attempt === retries - 1) {
          throw error instanceof Error ? error : new Error('Grok request failed after retries');
        }

        await sleep(1000 * Math.pow(2, attempt));
      }
    }

    throw new Error('Unexpected end of chat()');
  }

  async healthCheck(): Promise<string> {
    try {
      const response = await this.chat('Give me a short fun fact', {
        systemPrompt: 'Health check',
        temperature: 0.3,
        maxTokens: 64,
        retries: 2,
        format: 'text',
      });

      return response;
    } catch (error) {
      console.error('[GrokProvider] Error during healthCheck:', error);
      if (error instanceof Error) throw error;
      throw new Error('Grok AI service failed with unknown error');
    }
  }
}
