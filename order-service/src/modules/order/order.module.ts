import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './repository/order.entity';
import { OrderItemEntity } from './repository/order-item.entity';
import { OrderRepository } from './repository/order.repository';
import { OrderItemRepository } from './repository/order-item.repository';
import { OrderService } from './order.service';
import { UtilitiesModule } from 'src/utilities/utilities.module';
import { HttpModule } from '@nestjs/axios';
import { OrderPublicController } from './order.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderItemEntity]),
    UtilitiesModule,
    HttpModule,
  ],
  controllers: [OrderPublicController],
  providers: [OrderService, OrderRepository, OrderItemRepository],
  exports: [OrderService, OrderRepository, OrderItemRepository],
})
export class OrderModule {}
