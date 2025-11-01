import queueConfigController from '@/controllers/queueConfig.controller';
import { Router } from 'express';

const queueConfigRouter = Router();

queueConfigRouter.get('/', queueConfigController.getAll);

queueConfigRouter.patch('/:queueName/toggle', queueConfigController.toggle);

export default queueConfigRouter;
