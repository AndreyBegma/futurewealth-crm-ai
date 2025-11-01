import queueConfigService from '@/services/queueConfig.service';
import { bull } from '@/config/config';

interface QueueDefinition {
  name: string;
  defaultCronPattern: string;
}

class SchedulerInitializer {
  private queueDefinitions: QueueDefinition[] = [
    {
      name: 'contact-generation',
      defaultCronPattern: bull.contactGenerationCron,
    },
    {
      name: 'email-generation',
      defaultCronPattern: bull.emailGenerationCron,
    },
  ];

  async ensureQueueConfigs() {
    console.log('[SchedulerInitializer] Checking queue configurations...');

    for (const definition of this.queueDefinitions) {
      await this.ensureConfig(definition);
    }

    console.log('[SchedulerInitializer] Queue configurations initialized');
  }

  private async ensureConfig(definition: QueueDefinition) {
    let config = await queueConfigService.getQueueConfig(definition.name);

    if (!config) {
      console.log(
        `[SchedulerInitializer] Creating config for ${definition.name} with default cron: 
  ${definition.defaultCronPattern}`
      );

      config = await queueConfigService.updateConfig(definition.name, {
        enabled: false,
        cronPattern: definition.defaultCronPattern,
        concurrency: 1,
        maxJobsPerMin: 10,
      });

      console.log(`[SchedulerInitializer] Created config for ${definition.name}`);
    } else {
      console.log(`[SchedulerInitializer] Config for ${definition.name} already exists`);
    }
  }
}

export default new SchedulerInitializer();
