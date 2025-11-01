import { Router } from 'express';

import pipelineController from '@/controllers/pipeline.controller';

const router = Router();

router.post('/sentiment/try', (req, res) => pipelineController.runSentiment(req, res));
router.post('/summarise/try', (req, res) => pipelineController.runSummarise(req, res));

export default router;

