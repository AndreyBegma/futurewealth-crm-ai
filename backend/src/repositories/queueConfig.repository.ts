import prisma from '@/config/database';

class QueueConfigRepository {
  async findByQueueName(queueName: string) {
    return await prisma.queueConfig.findUnique({
      where: { queueName },
    });
  }
  async upsert(
    queueName: string,
    data: { enabled?: boolean; cronPattern?: string; concurrency?: number; maxJobsPerMin?: number }
  ) {
    return await prisma.queueConfig.upsert({
      where: { queueName },
      update: data,
      create: {
        queueName,
        enabled: data.enabled ?? false,
        cronPattern: data.cronPattern,
        concurrency: data.concurrency ?? 1,
        maxJobsPerMin: data.maxJobsPerMin ?? 10,
      },
    });
  }
  async getAll() {
    return await prisma.queueConfig.findMany();
  }
  async isQueueEnabled(queueName: string): Promise<boolean> {
    let config = await this.findByQueueName(queueName);

    if (!config) {
      config = await this.upsert(queueName, {
        enabled: false,
        concurrency: 1,
        maxJobsPerMin: 10,
      });
    }

    return config.enabled;
  }
}

export default new QueueConfigRepository();
