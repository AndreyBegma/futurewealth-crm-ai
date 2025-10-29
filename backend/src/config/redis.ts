import Redis from 'ioredis';
import { redis } from './config';

class RedisConfig {
  private static instance: Redis | null = null;

  static getClient(): Redis {
    if (!this.instance) {
      this.instance = new Redis({
        host: redis.host,
        port: Number(redis.port),
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });
    }

    this.instance.on('connect', () => {
      console.log('Redis connected');
    });
    this.instance.on('error', (err) => {
      console.error(err);
    });
    return this.instance;
  }
}

export default RedisConfig;
