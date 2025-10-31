import { CronJob } from 'cron';
import { contactQueue } from '../queues';
import { GenerateContactJobData } from '../jobs/contact.jobs';
import { bull } from '@/config/config';

const contactScheduler = new CronJob(
  bull.contactGenerationCron,
  async () => {
    console.log('[ContactScheduler] Cron job triggered');
    try {
      const jobData: GenerateContactJobData = {
        triggeredBy: 'cron',
        timestamp: new Date().toISOString(),
      };
      await contactQueue.add('cron-contact', jobData, {
        priority: 1,
      });
    } catch (error) {
      console.log('[ContactScheduler] Cron job failed', error);
    }
  },
  null,
  false,
  'UTC'
);

export default contactScheduler;
