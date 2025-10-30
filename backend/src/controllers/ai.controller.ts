import ollamaService from '@/services/ollama.service';
import { Request, Response } from 'express';

class AIController {
  async healthCheck(req: Request, res: Response): Promise<void> {
    const response = await ollamaService.healthCheck();
    res.status(200).json({
      response,
    });
  }
}

export default new AIController();
