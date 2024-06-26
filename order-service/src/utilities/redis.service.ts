import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly redisClient1: Redis;
  private readonly redisClient2: Redis;

  constructor() {
    this.redisClient1 = new Redis({
      host: 'localhost', // Địa chỉ Redis 1
      port: 6379, // Cổng Redis 1
    });

    this.redisClient2 = new Redis({
      host: 'localhost', // Địa chỉ Redis 2
      port: 6380, // Cổng Redis 2
    });
  }

  getClient1(): Redis {
    return this.redisClient1;
  }

  getClient2(): Redis {
    return this.redisClient2;
  }

  async evalClient1(script: string, keys: string[], args: any[]): Promise<any> {
    return this.redisClient1.eval(script, keys.length, ...keys, ...args);
  }
}
