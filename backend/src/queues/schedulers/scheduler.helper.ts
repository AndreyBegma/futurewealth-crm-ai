import queueConfigService from '@/services/queueConfig.service';

export const createSchedulerJob = (
  queueName: string,
  jobHandler: () => Promise<boolean>
) => {
  return async () => {
    console.log(`[${queueName}Scheduler] Cron job triggered`);

    const isEnabled = await queueConfigService.isQueueEnabled(queueName);

    if (!isEnabled) {
      console.log(`[${queueName}Scheduler] Queue is disabled, skipping job creation`);
      return;
    }

    try {
      const hasJobs = await jobHandler();
      if (hasJobs) {
        console.log(`[${queueName}Scheduler] Job added to queue successfully`);
      } else {
        console.log(`[${queueName}Scheduler] No jobs enqueued`);
      }
    } catch (error) {
      console.error(`[${queueName}Scheduler] Failed to add job:`, error);
    }
  };
};
