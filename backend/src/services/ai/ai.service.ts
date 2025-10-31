import { ai } from '@/config/config';
import { ChatOptions, IAIProvider } from './ai.interface';
import { OllamaProvider } from './providers/ollama.provider';
import { GrokProvider } from './providers/grok.provider';

class AIService {
  private provider: IAIProvider;

  constructor() {
    this.provider = this.createProvider();
  }

  private createProvider(): IAIProvider {
    const providerType = ai.provider.toLowerCase();

    switch (providerType) {
      case 'ollama':
        return new OllamaProvider(ai.host, ai.model);
      case 'grok':
        return new GrokProvider(ai.host, ai.model, ai.apiKey);
      default:
        throw new Error(`Unsupported AI provider: ${ai.provider}`);
    }
  }

  async chat(prompt: string, options?: ChatOptions): Promise<string> {
    return this.provider.chat(prompt, options);
  }

  async healthCheck(): Promise<string> {
    return this.provider.healthCheck();
  }
}

export default new AIService();
