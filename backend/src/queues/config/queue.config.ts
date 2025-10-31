import { QueueOptions } from 'bullmq';
import RedisConfig from '@/config/redis';
import { bull } from '@/config/config';

export const getQueueOptions = (): QueueOptions => ({
  connection: RedisConfig.getClient(),
  prefix: bull.prefix,
  defaultJobOptions: {
    attempts: bull.jobAttempts,
    backoff: {
      type: 'exponential',
      delay: bull.jobBackoffDelay,
    },
    removeOnComplete: {
      count: bull.jobBackoffDelay,
    },
    removeOnFail: {
      count: bull.removeOnFail,
    },
  },
});
