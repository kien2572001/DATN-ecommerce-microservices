import { Module } from '@nestjs/common';
import { CartPublicController } from './controllers/cart.public.controller';
import { CartService } from './cart.service';
import { CartRepository } from './repository/cart.repository';
import { UtilitiesModule } from '../../utilities/utilities.module';
import { HttpModule } from '@nestjs/axios';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [UtilitiesModule, HttpModule, InventoryModule],
  controllers: [CartPublicController],
  providers: [CartService, CartRepository],
  exports: [CartService, CartRepository],
})
export class CartModule {}
