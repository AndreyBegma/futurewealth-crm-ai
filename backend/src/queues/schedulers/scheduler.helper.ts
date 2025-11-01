import queueConfigService from '@/services/queueConfig.service';

export const createSchedulerJob = (
  queueName: string,
  jobHandler: () => Promise<void>
) => {
  return async () => {
    console.log(`[${queueName}Scheduler] Cron job triggered`);

    const isEnabled = await queueConfigService.isQueueEnabled(queueName);

    if (!isEnabled) {
      console.log(`[${queueName}Scheduler] Queue is disabled, skipping job creation`);
      return;
    }

    try {
      await jobHandler();
      console.log(`[${queueName}Scheduler] Job added to queue successfully`);
    } catch (error) {
      console.error(`[${queueName}Scheduler] Failed to add job:`, error);
    }
  };
};
