import graphService from '@/services/graph.service';
import { Request, Response } from 'express';

class GraphController {
  async getInboxMessages(req: Request, res: Response) {
    try {
      const { userUpn } = req.params;
      console.log('[GraphController] Fetching inbox for:', userUpn);
      const result = await graphService.getInboxMessages(userUpn);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err,
      });
    }
  }

  async sendTestMail(req: Request, res: Response) {
    try {
      const result = await graphService.sendTestMail(
        req.body.userUpn,
        req.body.to,
        req.body.subject,
        req.body.body
      );
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err,
      });
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const result = await graphService.getAllUsers();
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err,
      });
    }
  }
}

export default new GraphController();
