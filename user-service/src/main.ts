import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.use(async (req: any, res: any, next: any) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS',
    );
    next();
  });
  app.useGlobalPipes(new ValidationPipe());
  const configService = app.get(ConfigService);
  const port = configService.get('port');

  await app.listen(port, () => {
    console.log(`User service is running on port ${port}`);
  });
}

bootstrap();
