import { Module } from '@nestjs/common';
import { InventoryPublicController } from './controllers/inventory.public.controller';
import { InventoryService } from './inventory.service';
import { InventoryRepository } from './repository/inventory.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryEntity } from './repository/inventory.entity';
import { UtilitiesModule } from '../../utilities/utilities.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import configuration from 'src/configs/configuration';
import { join } from 'path';
@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryEntity]),
    UtilitiesModule,
    ClientsModule.register([
      {
        name: 'INVENTORY_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'inventory-service',
            brokers: [configuration().broker],
          },
          consumer: {
            groupId: 'inventory-consumer',
          },
        },
      },
    ]),
    ClientsModule.register([
      {
        name: 'INVENTORY_GRPC_PACKAGE',
        transport: Transport.GRPC,
        options: {
          url: configuration().inventory_grpc_url,
          package: 'inventory',
          protoPath: join(
            process.cwd(),
            'src/modules/inventory/inventory.proto',
          ),
        },
      },
    ]),
  ],
  controllers: [InventoryPublicController],
  providers: [InventoryService, InventoryRepository],
  exports: [InventoryService, InventoryRepository],
})
export class InventoryModule {}
