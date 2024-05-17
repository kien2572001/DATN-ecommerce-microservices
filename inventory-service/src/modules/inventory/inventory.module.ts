import {Module} from '@nestjs/common';
import {InventoryPublicController} from "./controllers/inventory.public.controller";
import {InventoryService} from "./inventory.service";
import {InventoryRepository} from "./repository/inventory.repository";
import {TypeOrmModule} from '@nestjs/typeorm';
import {InventoryEntity} from "./repository/inventory.entity";
import {UtilitiesModule} from "../../utilities/utilities.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryEntity]),
    UtilitiesModule,
  ],
  controllers: [InventoryPublicController],
  providers: [InventoryService, InventoryRepository],
  exports: [InventoryService, InventoryRepository]
})
export class InventoryModule {
}