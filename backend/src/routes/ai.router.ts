import { Router } from 'express';
import aiController from '@/controllers/ai.controller';

const aiRouter = Router();

aiRouter.get('/health', aiController.healthCheck);

aiRouter.post('/contact', aiController.createContact);
aiRouter.post('/spam', aiController.createSpam);
aiRouter.post('/email/from-contact', aiController.createEmailFromContact);

export default aiRouter;
