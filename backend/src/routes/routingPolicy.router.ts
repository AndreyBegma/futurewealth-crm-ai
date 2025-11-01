import { Router } from 'express';

import routingPolicyController from '@/controllers/routingPolicy.controller';

const router = Router();

router.get('/', (req, res) => routingPolicyController.list(req, res));
router.get('/active', (req, res) => routingPolicyController.listEnabled(req, res));
router.get('/:id', (req, res) => routingPolicyController.getById(req, res));
router.post('/', (req, res) => routingPolicyController.create(req, res));
router.put('/:id', (req, res) => routingPolicyController.update(req, res));
router.delete('/:id', (req, res) => routingPolicyController.delete(req, res));

export default router;

