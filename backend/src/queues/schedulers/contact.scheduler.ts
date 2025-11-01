import { CronJob } from 'cron';
import { contactQueue } from '../queues';
import { GenerateContactJobData } from '../jobs/contact.jobs';
import { bull } from '@/config/config';
import { createSchedulerJob } from './scheduler.helper';

const contactScheduler = new CronJob(
  bull.contactGenerationCron,
  createSchedulerJob('contact-generation', async () => {
    const jobData: GenerateContactJobData = {
      triggeredBy: 'cron',
      timestamp: new Date().toISOString(),
    };

    await contactQueue.add('generate-contact', jobData);
  }),
  null,
  false,
  'UTC'
);

export default contactScheduler;
