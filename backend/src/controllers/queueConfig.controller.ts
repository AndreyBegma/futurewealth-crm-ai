import { Request, Response } from 'express';
import queueConfigService from '@/services/queueConfig.service';

class QueueConfigController {
  async getAll(req: Request, res: Response) {
    try {
      const configs = await queueConfigService.getAllConfigs();

      res.status(200).json({
        success: true,
        data: configs,
      });
    } catch (error) {
      console.error('[QueueConfigController] Failed to get configs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get queue configurations',
      });
    }
  }

  async toggle(req: Request, res: Response) {
    try {
      const { queueName } = req.params;
      const { enabled } = req.body;

      if (typeof enabled !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Field "enabled" must be a boolean',
        });
      }

      const updated = await queueConfigService.toggleQueue(queueName, enabled);

      res.json({
        success: true,
        message: `Queue ${queueName} ${enabled ? 'enabled' : 'disabled'}`,
        data: updated,
      });
    } catch (error) {
      console.error('[QueueConfigController] Failed to toggle queue:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle queue',
      });
    }
  }
}

export default new QueueConfigController();
