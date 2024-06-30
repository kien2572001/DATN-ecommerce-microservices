import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { ClientKafka, Transport } from '@nestjs/microservices';
import configuration from './configs/configuration';
import { v4 as uuidv4 } from 'uuid';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import * as fastifyCors from 'fastify-cors';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule, { cors: true });
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.register(fastifyCors, {
    origin: true, // Cho phép tất cả các origin (hoặc cấu hình theo nhu cầu của bạn)
  });
  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'order-service' + uuidv4(),
        brokers: [configuration().broker],
      },
      consumer: {
        groupId: 'order-consumer',
      },
    },
  });
  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'flash-sale-service' + uuidv4(),
        brokers: [configuration().broker],
      },
      consumer: {
        groupId: 'flash-sale-consumer',
      },
    },
  });

  app.useGlobalPipes(new ValidationPipe());
  const configService = app.get(ConfigService);
  const port = configService.get('port');
  await app.startAllMicroservices();
  await app.listen(port, () => {
    console.log(`Order service is running on port ${port}`);
  });
}

bootstrap();
