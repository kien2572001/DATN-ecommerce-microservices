import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly redisClients: Record<number, Redis>;

  constructor() {
    this.redisClients = {
      0: new Redis({
        host: 'localhost',
        port: 6378,
      }),
      1: new Redis({
        host: 'localhost',
        port: 6379,
      }),
      2: new Redis({
        host: 'localhost',
        port: 6380,
      }),
      3: new Redis({
        host: 'localhost',
        port: 6381,
      }),
      4: new Redis({
        host: 'localhost',
        port: 6382,
      }),
    };
  }

  getClient(clientNumber: number): Redis {
    const client = this.redisClients[clientNumber];
    if (!client) {
      throw new Error(`Redis client ${clientNumber} does not exist`);
    }
    return client;
  }

  async evalClient(
    clientNumber: number,
    script: string,
    keys: string[],
    args: any[],
  ): Promise<any> {
    const client = this.getClient(clientNumber);
    return client.eval(script, keys.length, ...keys, ...args);
  }
}
