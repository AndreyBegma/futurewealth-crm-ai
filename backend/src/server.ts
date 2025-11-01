import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';

import { port } from '@config/config';
import corsOptions from '@config/cors';
import { v1Router } from './routes';
import RedisConfig from './config/redis';
import prisma from './config/database';

import { contactScheduler, emailScheduler, SchedulerInitializer } from './queues/schedulers';
import './queues/workers';
import { QueueSocketService } from './sockets/queue.socket';

const startServer = async () => {
  try {
    const app = express();

    RedisConfig.getClient();

    await SchedulerInitializer.ensureQueueConfigs();

    contactScheduler.start();
    emailScheduler.start();
    console.log('[Schedulers] Contact and Email schedulers started');

    prisma
      .$connect()
      .then(() => console.log('Database connected'))
      .catch((err) => {
        console.error(err);
      });
    const PORT = port || 4000;

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(cors(corsOptions));
    app.use(morgan('dev'));
    app.use(
      helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
      })
    );

    app.use('/v1', v1Router);

    const server = http.createServer(app);

    const queueSocketService = new QueueSocketService(server);
    console.log(' [Socket] Queue monitoring socket initialized');

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    const shutdown = async () => {
      console.log('Shutting down gracefully...');
      queueSocketService.close();
      await prisma.$disconnect();
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
