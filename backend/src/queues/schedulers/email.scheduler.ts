import { CronJob } from 'cron';
import { emailQueue } from '../queues';
import { EmailJobType, GenerateEmailJobData } from '../jobs/email.jobs';
import { bull } from '@/config/config';
import { createSchedulerJob } from './scheduler.helper';

const getRandomEmailType = (): EmailJobType => {
  const rand = Math.random() * 100;

  if (rand < 10) {
    return 'spam';
  } else {
    return 'normal';
  }
};

const emailScheduler = new CronJob(
  bull.emailGenerationCron,
  createSchedulerJob('email-generation', async () => {
    const jobData: GenerateEmailJobData = {
      type: getRandomEmailType(),
      triggeredBy: 'cron',
      timestamp: new Date().toISOString(),
    };

    await emailQueue.add('generate-email', jobData);
  }),
  null,
  false,
  'UTC'
);

export default emailScheduler;
