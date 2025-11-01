import aiService from '@/services/ai/ai.service';
import { buildSentimentPrompt } from '@/services/ai/prompts/sentimentAnalysis.prompt';
import { buildSummarisePrompt } from '@/services/ai/prompts/summarise.prompt';
import { SentimentPipelineInput, SummarisePipelineInput } from '@/types/pipeline.types';

class PipelineService {
  private parseJsonResponse(response: string) {
    const cleaned = response
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('[PipelineService] Failed to parse JSON response:', cleaned);
      throw new Error('Model returned invalid JSON');
    }
  }

  async runSentimentPipeline(input: SentimentPipelineInput) {
    const prompt = buildSentimentPrompt(input);
    const response = await aiService.chat(prompt, {
      format: 'json',
      temperature: 0.2,
      maxTokens: 600,
      retries: 2,
    });

    return this.parseJsonResponse(response);
  }

  async runSummarisePipeline(input: SummarisePipelineInput) {
    const prompt = buildSummarisePrompt(input);
    const response = await aiService.chat(prompt, {
      format: 'json',
      temperature: 0.3,
      maxTokens: 900,
      retries: 2,
    });

    return this.parseJsonResponse(response);
  }
}

export default new PipelineService();

