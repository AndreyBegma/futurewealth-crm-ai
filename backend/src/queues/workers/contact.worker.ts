import { Worker, Job } from 'bullmq';

import RedisConfig from '@/config/redis';
import { GenerateContactJobData, GenerateContactResult } from '../jobs/contact.jobs';
import { bull } from '@/config/config';

const contactWorker = new Worker<GenerateContactJobData, GenerateContactResult>(
  'contact-generation',
  async (job: Job<GenerateContactJobData>) => {
    const { triggeredBy, timestamp } = job.data;
    console.log(triggeredBy, timestamp);
    console.log('[ContactWorker] - New Job started');
    try {
      return {
        success: true,
        message: `Contact test generated`,
        contactId: 'test-id',
      };
    } catch (error) {
      console.error('[ContactWorker] - Job failed:', error);
      throw error;
    }
  },
  {
    connection: RedisConfig.getClient(),
    prefix: bull.prefix,
    concurrency: bull.workerConcurrency,
    limiter: {
      max: bull.maxJobsPerMinute,
      duration: 60000,
    },
  }
);

contactWorker.on('completed', (job, result) => {
  console.log(`[ContactWorker] - Job ${job.id} competed`);
  console.log(`result ${result.message}`);
});

contactWorker.on('failed', (job, result) => {
  console.log(`[ContactWorker] - Job ${job?.id} failed`);
  console.log(`result ${result.message}`);
});

contactWorker.on('error', (error) => {
  console.log(`[ContactWorker] - ${error}`);
});

contactWorker.on('active', (job) => {
  console.log(`[ContactWorker] - Job ${job.id} is now active`);
});


const shutdown = async () => {
    console.log('[ContactWorker] Shutting down gracefully...');
    await contactWorker.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  export default contactWorker;