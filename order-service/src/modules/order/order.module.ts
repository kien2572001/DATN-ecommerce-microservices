import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { UtilitiesModule } from 'src/utilities/utilities.module';
import { HttpModule } from '@nestjs/axios';
import { OrderPublicController } from './order.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import configuration from 'src/configs/configuration';
import { Order, OrderSchema } from './repository/order.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderRepository } from './repository/order.repository';
import { join } from 'path';
import { OrderEventController } from './order-event.controller';
import { RedisService } from 'src/utilities/redis.service';
import { InventoryModule } from '../inventory/inventory.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Order.name,
        schema: OrderSchema,
      },
    ]),
    UtilitiesModule,
    HttpModule,
    ClientsModule.register([
      {
        name: 'ORDER_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'order-service',
            brokers: [configuration().broker],
          },
          consumer: {
            groupId: 'order-consumer',
          },
        },
      },
    ]),
    ClientsModule.register([
      {
        name: 'INVENTORY_SERVICE_GRPC',
        transport: Transport.GRPC,
        options: {
          url: configuration().inventory_grpc_url,
          package: 'inventory',
          protoPath: join(process.cwd(), 'src/modules/order/inventory.proto'),
        },
      },
    ]),
    InventoryModule,
  ],
  controllers: [OrderPublicController, OrderEventController],
  providers: [OrderService, OrderRepository, RedisService],
  exports: [OrderService, OrderRepository],
})
export class OrderModule {}
