import { FlashSale } from './flashsale.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseAbstractRepository } from '../../base/base.abstract.repository';
import { PaginateModel } from 'mongoose';
@Injectable()
export class FlashSaleRepository extends BaseAbstractRepository<FlashSale> {
  constructor(
    @InjectModel(FlashSale.name)
    private readonly flashSaleModel: Model<FlashSale>,
    @InjectModel(FlashSale.name)
    private readonly flashSalePaginateModel: PaginateModel<FlashSale>,
  ) {
    super(flashSaleModel);
  }

  async getFlashSaleByShopIdWithPagination(
    shop_id: string,
    page: number,
    limit: number,
  ): Promise<any> {
    let query: any = { shop_id };
    console.log('query', query);

    const flashSales = await this.flashSalePaginateModel.paginate(query, {
      page,
      limit,
      sort: { time_start: -1 },
      lean: true,
    });
    return flashSales;
  }

  async getListActiveFlashSaleByStartTime(time_start: Date): Promise<any> {
    return await this.flashSaleModel
      .find({ time_start, is_active: true })
      .lean();
  }
}
