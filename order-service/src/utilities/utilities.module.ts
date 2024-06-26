import { Module } from '@nestjs/common';
import { ResponseHandler } from './response.handler';
import { RedisService } from './redis.service';

@Module({
  providers: [ResponseHandler, RedisService],
  exports: [ResponseHandler, RedisService],
})
export class UtilitiesModule {}
