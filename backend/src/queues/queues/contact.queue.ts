import { Queue } from 'bullmq';
import { GenerateContactJobData } from '../jobs/contact.jobs';
import { getQueueOptions } from '../config/queue.config';

export const contactQueue = new Queue<GenerateContactJobData>(
  'contact-generation',
  getQueueOptions()
);
