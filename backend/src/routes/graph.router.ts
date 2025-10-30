import graphController from '@/controllers/graph.controller';
import { Router } from 'express';

const graphRouter = Router();

graphRouter.get('/users', graphController.getAllUsers);
graphRouter.get('/inbox/:userUpn', graphController.getInboxMessages);
graphRouter.post('/send-test-mail', graphController.sendTestMail);


export default graphRouter;
