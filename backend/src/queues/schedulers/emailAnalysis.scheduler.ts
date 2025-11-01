import { CronJob } from 'cron';
import { emailAnalysisQueue } from '../queues';
import { EmailAnalysisJobData } from '../jobs/emailAnalysis.jobs';
import { bull } from '@/config/config';
import { createSchedulerJob } from './scheduler.helper';
import receivedEmailRepository from '@/repositories/receivedEmail.repository';
import { ProcessingStatus } from '@prisma/client';

const emailAnalysisScheduler = new CronJob(
  bull.emailAnalysisCron,
  createSchedulerJob('email-analysis', async () => {
    const pendingEmails = await receivedEmailRepository.findPendingAnalysis(50);

    if (pendingEmails.length === 0) {
      console.log('[EmailAnalysisScheduler] No pending emails found');
      return false;
    }

    let jobsAdded = 0;
    for (const email of pendingEmails) {
      const jobData: EmailAnalysisJobData = {
        emailId: email.id,
        triggeredBy: 'scheduler',
        timestamp: new Date().toISOString(),
      };

      await emailAnalysisQueue.add('analyze-email', jobData, {
        priority: 2,
      });
      jobsAdded += 1;
    }

    console.log(`[EmailAnalysisScheduler] Added ${jobsAdded} jobs to queue`);
    return jobsAdded > 0;
  }),
  null,
  false,
  'UTC'
);

export default emailAnalysisScheduler;
