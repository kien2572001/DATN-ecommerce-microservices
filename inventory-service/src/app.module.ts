import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './configs/configuration';
import { JwtPayloadMiddleware } from './middlewares/jwt-payload.middleware';
import { LoggingMiddleware } from './middlewares/logging.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryEntity } from './modules/inventory/repository/inventory.entity';
import { InventoryModule } from './modules/inventory/inventory.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { CartModule } from './modules/cart/cart.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        port: configService.get('redis.port'),
        host: configService.get('redis.host'),
      }),
      inject: [ConfigService],
    }),
    // MongooseModule.forRootAsync({
    //   useFactory: (configService: ConfigService) => ({
    //     uri: configService.get('no_sql_db_uri'),
    //   }),
    //   inject: [ConfigService],
    // }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('relational_db.host'),
        port: configService.get('relational_db.port'),
        username: configService.get('relational_db.username'),
        password: configService.get('relational_db.password'),
        database: configService.get('relational_db.database'),
        entities: [InventoryEntity],
        synchronize: true,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    InventoryModule,
    CartModule,
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
