import {MiddlewareConsumer, Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ConfigModule, ConfigService} from "@nestjs/config";
import configuration from "./configs/configuration";
import {JwtPayloadMiddleware} from "./middlewares/jwt-payload.middleware";
import {TypeOrmModule} from '@nestjs/typeorm';
import {CategoryModule} from "./modules/category/category.module";
import {ProductModule} from "./modules/product/product.module";
import {ReviewModule} from "./modules/review/review.module";
import {ReactionModule} from "./modules/reaction/reaction.module";
import {InventoryModule} from "./modules/inventory/inventory.module";
import {ProductVariationModule} from "./modules/product-variation/product-variation.module";
import {CacheModule} from "@nestjs/cache-manager";
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('relational_db.host'),
        port: configService.get('relational_db.port'),
        username: configService.get('relational_db.username'),
        password: configService.get('relational_db.password'),
        database: configService.get('relational_db.database'),
        entities: [],
        synchronize: true,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('redis.host'),
        port: configService.get('redis.port'),
      }),
      inject: [ConfigService],
    }),
    InventoryModule,
    CategoryModule,
    ProductModule,
    ReactionModule,
    ReviewModule,
    ProductVariationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtPayloadMiddleware).forRoutes('/private');
  }
}
