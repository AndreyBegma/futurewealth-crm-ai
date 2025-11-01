import { Worker, Job } from 'bullmq';

import RedisConfig from '@/config/redis';
import { GenerateEmailJobData, GenerateEmailResult } from '../jobs/email.jobs';
import { bull } from '@/config/config';
import emailGenerator from '@/services/ai/generators/email.generator';
import queueConfigService from '@/services/queueConfig.service';

export const createEmailWorker = async () => {
  const config = await queueConfigService.getQueueConfig('email-generation');
  const concurrency = config?.concurrency ?? bull.workerConcurrency;
  const maxJobsPerMin = config?.maxJobsPerMin ?? bull.maxJobsPerMinute;

  const worker = new Worker<GenerateEmailJobData, GenerateEmailResult>(
    'email-generation',
    async (job: Job<GenerateEmailJobData>) => {
      const { type, contactId } = job.data;

      try {
        const generatedEmail =
          type === 'spam'
            ? await emailGenerator.generateSpam()
            : await emailGenerator.generateFromContact({ contactId, includeHistory: true });

        return {
          success: true,
          message: `Email generated (type: ${type})`,
          emailId: generatedEmail.id,
          type,
        };
      } catch (error) {
        console.error('[EmailWorker] - Job failed:', error);
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
    console.log(`[EmailWorker] - Job ${job.id} competed`);
    console.log(`result ${result.message}`);
  });

  worker.on('failed', (job, result) => {
    console.log(`[EmailWorker] - Job ${job?.id} failed`);
    console.log(`result ${result.message}`);
  });

  worker.on('error', (error) => {
    console.log(`[EmailWorker] - ${error}`);
  });

  worker.on('active', (job) => {
    console.log(`[EmailWorker] - Job ${job.id} is now active`);
  });

  const shutdown = async () => {
    console.log('[EmailWorker] Shutting down gracefully...');
    await worker.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return worker;
};
