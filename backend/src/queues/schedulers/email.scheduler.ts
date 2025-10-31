import { CronJob } from 'cron';
import { emailQueue } from '../queues';
import { EmailJobType, GenerateEmailJobData } from '../jobs/email.jobs';
import { bull } from '@/config/config';

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
  async () => {
    console.log('[EmailScheduler] Cron job triggered');
    try {
      const jobData: GenerateEmailJobData = {
        type: getRandomEmailType(),
        triggeredBy: 'cron',
        timestamp: new Date().toISOString(),
      };
      await emailQueue.add('cron-email', jobData, {
        priority: 1,
      });
    } catch (error) {
      console.log('[EmailScheduler] Cron job failed', error);
    }
  },
  null,
  false,
  'UTC'
);

export default emailScheduler;
