import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ConfigService} from "@nestjs/config";
import {ValidationPipe} from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {cors: true});
  app.useGlobalPipes(new ValidationPipe());
  const configService = app.get(ConfigService);
  const port = configService.get('port');
  await app.listen(port, () => {
    console.log(`Product service is running on port ${port}`);
  });
}

bootstrap();
