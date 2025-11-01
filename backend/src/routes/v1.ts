import { Router } from 'express';
import authRouter from './auth.router';
import aiRouter from './ai.router';
import graphRouter from './graph.router';
import queueRouter from './queue.router';
import queueConfigRouter from './queueConfig.router';
import routingPolicyRouter from './routingPolicy.router';
import pipelineRouter from './pipeline.router';

const v1Router = Router();

v1Router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Server is running',
  });
});

v1Router.use('/auth', authRouter);
v1Router.use('/ai', aiRouter);
v1Router.use('/mail', graphRouter);
v1Router.use('/queues', queueRouter);
v1Router.use('/queues-config', queueConfigRouter);
v1Router.use('/routing-policy', routingPolicyRouter);
v1Router.use('/pipeline', pipelineRouter);

export default v1Router;
