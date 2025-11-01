import Redis from 'ioredis';
import { redis } from './config';

class RedisConfig {
  private static instance: Redis | null = null;

  static getClient(): Redis {
    if (!this.instance) {
      const client = new Redis({
        host: redis.host,
        port: Number(redis.port),
        maxRetriesPerRequest: null,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      client.on('connect', () => {
        console.log('Redis connected');
      });
      client.on('error', (err) => {
        console.error(err);
      });

      this.instance = client;
    }

    return this.instance;
  }
}

export default RedisConfig;
