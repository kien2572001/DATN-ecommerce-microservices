import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopRepositoryModule } from './repository/shop.repository.module';
import { ShopPrivateController } from './controllers/shop.private.controller';
import { ShopPublicController } from './controllers/shop.public.controller';
import { UtilitiesModule } from '../../utilities/utilities.module';

@Module({
  imports: [ShopRepositoryModule, UtilitiesModule],
  controllers: [ShopPrivateController, ShopPublicController],
  providers: [ShopService],
  exports: [ShopService],
})
export class ShopModule {}
