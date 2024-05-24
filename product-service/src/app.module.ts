import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './configs/configuration';
import { JwtPayloadMiddleware } from './middlewares/jwt-payload.middleware';
import { LoggingMiddleware } from './middlewares/logging.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('no_sql_db_uri'),
      }),
      inject: [ConfigService],
    }),
    // TypeOrmModule.forRootAsync({
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'mysql',
    //     host: configService.get('relational_db.host'),
    //     port: configService.get('relational_db.port'),
    //     username: configService.get('relational_db.username'),
    //     password: configService.get('relational_db.password'),
    //     database: configService.get('relational_db.database'),
    //     entities: [],
    //     synchronize: true,
    //     autoLoadEntities: true,
    //   }),
    //   inject: [ConfigService],
    // }),
    CacheModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('redis.host'),
        port: configService.get('redis.port'),
      }),
      inject: [ConfigService],
    }),
    CategoryModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
    consumer.apply(JwtPayloadMiddleware).forRoutes('/private');
  }
}
