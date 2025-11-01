import { Queue } from 'bullmq';
import { getQueueOptions } from '../config/queue.config';
import { EmailAnalysisJobData } from '../jobs/emailAnalysis.jobs';

export const emailAnalysisQueue = new Queue<EmailAnalysisJobData>(
  'email-analysis',
  getQueueOptions()
);
