import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import configuration from './configs/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  console.log(configuration().broker);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: configuration().services.inventory.clientId,
        brokers: [configuration().broker],
      },
      consumer: {
        groupId: configuration().services.inventory.groupId,
      },
    },
  });

  await app.startAllMicroservices();

  app.useGlobalPipes(new ValidationPipe());
  const configService = app.get(ConfigService);
  const port = configService.get('port');
  await app.listen(port, () => {
    console.log(`Product service is running on port ${port}`);
  });
}

bootstrap();
