import { FlashSaleProduct } from './flashsale-product.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseAbstractRepository } from '../../base/base.abstract.repository';
import { PaginateModel } from 'mongoose';

@Injectable()
export class FlashSaleProductRepository extends BaseAbstractRepository<FlashSaleProduct> {
  constructor(
    @InjectModel(FlashSaleProduct.name)
    private readonly flashSaleProductModel: Model<FlashSaleProduct>,
    @InjectModel(FlashSaleProduct.name)
    private readonly flashSaleProductPaginateModel: PaginateModel<FlashSaleProduct>,
  ) {
    super(flashSaleProductModel);
  }

  async getLatestFlashSaleProductByProductId(
    productId: string,
  ): Promise<FlashSaleProduct> {
    const currentTime = new Date();
    console.log('currentTime', currentTime);
    return this.flashSaleProductModel
      .findOne({
        productId,
        time_start: { $gt: currentTime },
        is_active: true,
      })
      .sort({ time_start: -1 })
      .limit(1)
      .lean();
  }

  async deleteManyByFlashSaleId(flashSaleId: string): Promise<boolean> {
    const deletedFlashSaleProducts =
      await this.flashSaleProductModel.deleteMany({
        flash_sale_id: flashSaleId,
      });
    return !!deletedFlashSaleProducts.deletedCount;
  }
}
