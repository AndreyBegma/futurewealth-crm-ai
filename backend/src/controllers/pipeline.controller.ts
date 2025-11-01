import { Request, Response } from 'express';

import pipelineService from '@/services/pipeline.service';
import { SentimentPipelineInput, SummarisePipelineInput } from '@/types/pipeline.types';

class PipelineController {
  async runSentiment(req: Request, res: Response) {
    try {
      const payload = req.body as SentimentPipelineInput;

      if (!payload?.account || !Array.isArray(payload?.messages)) {
        return res.status(400).json({ error: 'Invalid payload' });
      }

      const result = await pipelineService.runSentimentPipeline(payload);
      return res.json({ result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to run sentiment pipeline';
      return res.status(500).json({ error: message });
    }
  }

  async runSummarise(req: Request, res: Response) {
    try {
      const payload = req.body as SummarisePipelineInput;

      if (!payload?.account || !Array.isArray(payload?.messages)) {
        return res.status(400).json({ error: 'Invalid payload' });
      }

      const result = await pipelineService.runSummarisePipeline(payload);
      return res.json({ result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to run summarise pipeline';
      return res.status(500).json({ error: message });
    }
  }
}

export default new PipelineController();

