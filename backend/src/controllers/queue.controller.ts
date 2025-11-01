import { Request, Response } from 'express';
import queueService from '@/services/queue.service';

class QueueController {
  async getStats(req: Request, res: Response) {
    try {
      const stats = await queueService.getStats();
      return res.json(stats);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to get stats' });
    }
  }

  async getJobs(req: Request, res: Response) {
    try {
      const { queueName } = req.params;
      const { status = 'waiting', limit = 10 } = req.query;

      const jobsData = await queueService.getJobs(
        queueName,
        status as string,
        Number(limit)
      );

      return res.json({ jobs: jobsData, count: jobsData.length });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get jobs';
      const statusCode = message === 'Queue not found' ? 404 : 500;
      return res.status(statusCode).json({ error: message });
    }
  }

  async getWorkers(req: Request, res: Response) {
    try {
      const workersStatus = await queueService.getWorkersStatus();
      return res.json(workersStatus);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to get workers status' });
    }
  }
}

export default new QueueController();
