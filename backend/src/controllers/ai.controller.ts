import aiService from '@/services/ai/ai.service';
import contactGenerator from '@/services/ai/generators/contact.generator';
import emailGenerator from '@/services/ai/generators/email.generator';
import { Request, Response } from 'express';

class AIController {
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const response = await aiService.healthCheck();
      res.status(200).json({
        status: 'ok',
        response,
      });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  async createContact(req: Request, res: Response): Promise<void> {
    try {
      const contact = await contactGenerator.generate(req.body);
      res.status(201).json({
        data: contact,
      });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  async createSpam(req: Request, res: Response): Promise<void> {
    try {
      const email = await emailGenerator.generateSpam(req.body);
      res.status(201).json({
        data: email,
      });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  async createEmailFromContact(req: Request, res: Response): Promise<void> {
    try {
      const { contactId, includeHistory, maxHistoryItems } = req.body;
      const email = await emailGenerator.generateFromContact({
        contactId,
        includeHistory,
        maxHistoryItems,
      });
      res.status(201).json({
        data: email,
      });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }
}

export default new AIController();
