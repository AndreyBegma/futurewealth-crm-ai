import { Worker, Job } from 'bullmq';

import RedisConfig from '@/config/redis';
import { GenerateEmailJobData, GenerateEmailResult } from '../jobs/email.jobs';
import { bull } from '@/config/config';

const emailWorker = new Worker<GenerateEmailJobData, GenerateEmailResult>(
  'email-generation',
  async (job: Job<GenerateEmailJobData>) => {
    const { triggeredBy, timestamp, type, contactId } = job.data;
    console.log(triggeredBy, timestamp, type, contactId);
    console.log('[EmailWorker] - New Job started');
    try {
      return {
        success: true,
        message: `Email test generated (type: ${type})`,
        emailId: 'test-email-id',
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
