import { Worker, Job } from 'bullmq';

import RedisConfig from '@/config/redis';
import { GenerateEmailJobData, GenerateEmailResult } from '../jobs/email.jobs';
import { bull } from '@/config/config';
import emailGenerator from '@/services/ai/generators/email.generator';

const emailWorker = new Worker<GenerateEmailJobData, GenerateEmailResult>(
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
    concurrency: bull.workerConcurrency,
    limiter: {
      max: bull.maxJobsPerMinute,
      duration: 60000,
    },
  }
);

emailWorker.on('completed', (job, result) => {
  console.log(`[EmailWorker] - Job ${job.id} competed`);
  console.log(`result ${result.message}`);
});

emailWorker.on('failed', (job, result) => {
  console.log(`[EmailWorker] - Job ${job?.id} failed`);
  console.log(`result ${result.message}`);
});

emailWorker.on('error', (error) => {
  console.log(`[EmailWorker] - ${error}`);
});

emailWorker.on('active', (job) => {
  console.log(`[EmailWorker] - Job ${job.id} is now active`);
});

const shutdown = async () => {
  console.log('[EmailWorker] Shutting down gracefully...');
  await emailWorker.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default emailWorker;
