import {Module} from "@nestjs/common";
import {TypeOrmModule} from '@nestjs/typeorm';
import {InventoryEntity} from './repository/inventory.entity';
import {UtilitiesModule} from "../../utilities/utilities.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryEntity]),
    UtilitiesModule,
  ],
})
export class InventoryModule {
}