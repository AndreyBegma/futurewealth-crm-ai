import { Queue } from 'bullmq';
import { getQueueOptions } from '../config/queue.config';
import { GenerateEmailJobData } from '../jobs/email.jobs';

export const emailQueue = new Queue<GenerateEmailJobData>('email-generation', getQueueOptions());
