import { Module } from '@nestjs/common';
import { UtilitiesModule } from '../../utilities/utilities.module';
import { FlashSale, FlashSaleSchema } from './flashsale.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { FlashSaleRepository } from './flashsale.repository';
import { FlashSaleService } from './flashsale.service';
import { HttpModule } from '@nestjs/axios';
import { FlashSalePublicController } from './flashsale.controller';
import { FlashSaleProductPublicController } from './flashsale-product.controller';
import {
  FlashSaleProduct,
  FlashSaleProductSchema,
} from './flashsale-product.entity';
import { FlashSaleProductRepository } from './flashsale-product.repository';
import { FlashSaleProductService } from './flashsale-product.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import configuration from 'src/configs/configuration';
@Module({
  imports: [
    UtilitiesModule,
    MongooseModule.forFeature([
      {
        name: FlashSale.name,
        schema: FlashSaleSchema,
      },
      {
        name: FlashSaleProduct.name,
        schema: FlashSaleProductSchema,
      },
    ]),
    HttpModule,
    ClientsModule.register([
      {
        name: 'FLASH_SALE_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'flash-sale-service',
            brokers: [configuration().broker],
          },
          consumer: {
            groupId: 'order-consumer',
          },
        },
      },
    ]),
  ],
  controllers: [FlashSalePublicController, FlashSaleProductPublicController],
  providers: [
    FlashSaleRepository,
    FlashSaleService,
    FlashSaleProductRepository,
    FlashSaleProductService,
  ],
  exports: [
    FlashSaleRepository,
    FlashSaleService,
    FlashSaleProductRepository,
    FlashSaleProductService,
  ],
})
export class FlashSaleModule {}
