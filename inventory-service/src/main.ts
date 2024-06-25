import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import configuration from './configs/configuration';
import { join } from 'path';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  console.log(configuration().broker);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'flash-sale',
        brokers: [configuration().broker],
      },
      consumer: {
        groupId: 'flash-sale-consumer',
      },
    },
  });

  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.GRPC,
  //   options: {
  //     url: 'localhost:5000',
  //     package: 'hello',
  //     protoPath: join(process.cwd(), 'src/hello.proto'),
  //   },
  // });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: process.env.INVENTORY_GRPC_URL,
      package: 'inventory',
      protoPath: join(process.cwd(), 'src/modules/inventory/inventory.proto'),
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
