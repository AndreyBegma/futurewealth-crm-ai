import { Router } from 'express';
import aiController from '@/controllers/ai.controller';

const aiRouter = Router();

aiRouter.get('/health', aiController.healthCheck);

export default aiRouter;
