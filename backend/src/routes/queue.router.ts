import queueController from '@/controllers/queue.controller';
import { Router } from 'express';

const queueRouter = Router();

queueRouter.get('/stats', queueController.getStats);
queueRouter.get('/workers', queueController.getWorkers);
queueRouter.get('/jobs', queueController.getJobs);

export default queueRouter;
