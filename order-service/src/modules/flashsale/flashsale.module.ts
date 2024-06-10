import { Module } from '@nestjs/common';
import { UtilitiesModule } from '../../utilities/utilities.module';
import { FlashSale, FlashSaleSchema } from './flashsale.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { FlashSaleRepository } from './flashsale.repository';
import { FlashSaleService } from './flashsale.service';
import { HttpModule } from '@nestjs/axios';
import { FlashSalePublicController } from './flashsale.controller';
@Module({
  imports: [
    UtilitiesModule,
    MongooseModule.forFeature([
      {
        name: FlashSale.name,
        schema: FlashSaleSchema,
      },
    ]),
    HttpModule,
  ],
  controllers: [FlashSalePublicController],
  providers: [FlashSaleRepository, FlashSaleService],
  exports: [FlashSaleRepository, FlashSaleService],
})
export class FlashSaleModule {}
