import { Worker, Job } from 'bullmq';

import RedisConfig from '@/config/redis';
import { GenerateContactJobData, GenerateContactResult } from '../jobs/contact.jobs';

import { bull } from '@/config/config';
import contactGenerator from '@/services/ai/generators/contact.generator';
import queueConfigService from '@/services/queueConfig.service';

export const createContactWorker = async () => {
  const config = await queueConfigService.getQueueConfig('contact-generation');
  const concurrency = config?.concurrency ?? bull.workerConcurrency;
  const maxJobsPerMin = config?.maxJobsPerMin ?? bull.maxJobsPerMinute;

  const worker = new Worker<GenerateContactJobData, GenerateContactResult>(
    'contact-generation',
    async (job: Job<GenerateContactJobData>) => {
      const { triggeredBy, timestamp } = job.data;
      console.log(triggeredBy, timestamp);
      console.log('[ContactWorker] - New Job started');
      try {
        const newContact = await contactGenerator.generate();

        return {
          success: true,
          message: `Contact ${newContact.firstName} ${newContact.lastName} generated`,
          contactId: newContact.id,
        };
      } catch (error) {
        console.error('[ContactWorker] - Job failed:', error);
        throw error;
      }
    },
    {
      connection: RedisConfig.getClient(),
      prefix: bull.prefix,
      concurrency,
      limiter: {
        max: maxJobsPerMin,
        duration: 60000,
      },
    }
  );

  worker.on('completed', (job, result) => {
    console.log(`[ContactWorker] - Job ${job.id} competed`);
    console.log(`result ${result.message}`);
  });

  worker.on('failed', (job, result) => {
    console.log(`[ContactWorker] - Job ${job?.id} failed`);
    console.log(`result ${result.message}`);
  });

  worker.on('error', (error) => {
    console.log(`[ContactWorker] - ${error}`);
  });

  worker.on('active', (job) => {
    console.log(`[ContactWorker] - Job ${job.id} is now active`);
  });

  const shutdown = async () => {
    console.log('[ContactWorker] Shutting down gracefully...');
    await worker.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return worker;
};
