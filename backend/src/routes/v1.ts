import { Router } from 'express';
import authRouter from './auth.router';
import aiRouter from './ai.router';
import graphRouter from './graph.router';
import queueRouter from './queue.router';
import queueConfigRouter from './queueConfig.router';

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

export default v1Router;
