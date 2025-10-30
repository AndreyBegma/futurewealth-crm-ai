import RedisConfig from '@/config/redis';
import Redis from 'ioredis';

class RedisService {
  private get client(): Redis {
    return RedisConfig.getClient();
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async getJSON<T>(key: string): Promise<T | null> {
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }

  async setJSON<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const jsonData = JSON.stringify(value);
    await this.set(key, jsonData, ttlSeconds);
  }
}

export default new RedisService();
