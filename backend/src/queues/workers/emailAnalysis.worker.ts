import { Worker, Job } from 'bullmq';

import RedisConfig from '@/config/redis';
import { EmailAnalysisJobData, EmailAnalysisResult } from '../jobs/emailAnalysis.jobs';
import { bull } from '@/config/config';
import receivedEmailRepository from '@/repositories/receivedEmail.repository';

import { ProcessingStatus } from '@prisma/client';
import threadService from '@/services/thread.service';
import accountService from '@/services/account.service';
import queueConfigService from '@/services/queueConfig.service';

export const createEmailAnalysisWorker = async () => {
  const config = await queueConfigService.getQueueConfig('email-analysis');
  const concurrency = config?.concurrency ?? bull.workerConcurrency;
  const maxJobsPerMin = config?.maxJobsPerMin ?? bull.maxJobsPerMinute;

  const worker = new Worker<EmailAnalysisJobData, EmailAnalysisResult>(
    'email-analysis',
    async (job: Job<EmailAnalysisJobData>) => {
      const { emailId } = job.data;
      const startTime = Date.now();

      try {
        console.log(`[EmailAnalysisWorker] Processing email ${emailId}...`);

        const email = await receivedEmailRepository.findById(emailId);
        if (!email) {
          throw new Error(`Email ${emailId} not found`);
        }

        if (email.processingStatus === ProcessingStatus.COMPLETED) {
          console.log(`[EmailAnalysisWorker] Email ${emailId} already processed, skipping`);
          return {
            success: true,
            message: 'Already processed',
            emailId,
            accountId: email.accountId || undefined,
            threadId: email.threadId || undefined,
          };
        }

        await receivedEmailRepository.updateProcessing(emailId, {
          processingStatus: ProcessingStatus.PROCESSING,
        });

        const account = await accountService.findOrCreate(email);
        console.log(`[EmailAnalysisWorker] Account: ${account.id} (${account.email})`);

        const thread = await threadService.findOrCreate(email, account);
        console.log(`[EmailAnalysisWorker] Thread: ${thread.id} (${thread.normalizedSubject})`);

        await receivedEmailRepository.updateProcessing(emailId, {
          accountId: account.id,
          threadId: thread.id,
          hasAccount: true,
          hasThread: true,
          processingStatus: ProcessingStatus.COMPLETED,
          processedAt: new Date(),
        });

        const processingTime = Date.now() - startTime;
        console.log(
          `[EmailAnalysisWorker] Email ${emailId} processed successfully in ${processingTime}ms`
        );

        return {
          success: true,
          message: 'Email processed successfully',
          emailId,
          accountId: account.id,
          threadId: thread.id,
          processingTime,
        };
      } catch (error) {
        console.error('[EmailAnalysisWorker] Job failed:', error);

        await receivedEmailRepository.updateProcessing(emailId, {
          processingStatus: ProcessingStatus.FAILED,
        });

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
    console.log(`[EmailAnalysisWorker] Job ${job.id} completed`);
    console.log(`Result: ${result.message}`);
  });

  worker.on('failed', (job, error) => {
    console.log(`[EmailAnalysisWorker] Job ${job?.id} failed`);
    console.error(`Error: ${error.message}`);
  });

  worker.on('error', (error) => {
    console.error(`[EmailAnalysisWorker] Error: ${error}`);
  });

  worker.on('active', (job) => {
    console.log(`[EmailAnalysisWorker] Job ${job.id} is now active`);
  });

  const shutdown = async () => {
    console.log('[EmailAnalysisWorker] Shutting down gracefully...');
    await worker.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return worker;
};
