import queueConfigRepository from '@/repositories/queueConfig.repository';
import redisService from '@/services/redis.service';

class QueueConfigService {
  private readonly CACHE_PREFIX = 'queue:config:';
  private readonly CACHE_TTL = 60;

  private getCacheKey(queueName: string): string {
    return `${this.CACHE_PREFIX}${queueName}`;
  }

  private async invalidateCache(queueName: string) {
    const cacheKey = this.getCacheKey(queueName);
    await redisService.del(cacheKey);
  }

  async isQueueEnabled(queueName: string): Promise<boolean> {
    const cacheKey = this.getCacheKey(queueName);

    const cached = await redisService.getJSON<{ enabled: boolean }>(cacheKey);
    if (cached !== null) {
      return cached.enabled;
    }
    const enabled = await queueConfigRepository.isQueueEnabled(queueName);

    await redisService.setJSON(cacheKey, { enabled }, this.CACHE_TTL);

    return enabled;
  }

  async getQueueConfig(queueName: string) {
    const cacheKey = this.getCacheKey(queueName);

    const cached = await redisService.getJSON<any>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    let config = await queueConfigRepository.findByQueueName(queueName);

    if (!config) {
      config = await queueConfigRepository.upsert(queueName, {
        enabled: false,
        cronPattern: '*/5 * * * *',
        concurrency: 1,
        maxJobsPerMin: 10,
      });
    }

    await redisService.setJSON(cacheKey, config, this.CACHE_TTL);

    return config;
  }

  async getAllConfigs() {
    return await queueConfigRepository.getAll();
  }

  async toggleQueue(queueName: string, enabled: boolean) {
    const updated = await queueConfigRepository.upsert(queueName, { enabled });

    await this.invalidateCache(queueName);

    return updated;
  }

  async updateConfig(
    queueName: string,
    data: {
      enabled?: boolean;
      cronPattern?: string;
      concurrency?: number;
      maxJobsPerMin?: number;
    }
  ) {
    const updated = await queueConfigRepository.upsert(queueName, data);

    await this.invalidateCache(queueName);

    return updated;
  }
}

export default new QueueConfigService();
