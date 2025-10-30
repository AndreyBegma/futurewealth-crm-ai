import { Router } from 'express';
import authRouter from './auth.router';
import aiRouter from './ai.router';

const v1Router = Router();

v1Router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Server is running',
  });
});

v1Router.use('/auth', authRouter);
v1Router.use('/ai', aiRouter);

export default v1Router;
