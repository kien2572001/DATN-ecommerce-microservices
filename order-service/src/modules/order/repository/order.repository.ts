import { Order, OrderSchema } from './order.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseAbstractRepository } from 'src/base/base.abstract.repository';
import { PaginateModel } from 'mongoose';
@Injectable()
export class OrderRepository extends BaseAbstractRepository<Order> {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @InjectModel(Order.name)
    private readonly orderPaginateModel: PaginateModel<Order>,
  ) {
    super(orderModel);
  }

  async findOrdersByShopIdWithPagination(
    shop_id: string,
    page: number,
    limit: number,
    status: string = 'all',
    code: string = '',
  ): Promise<any> {
    let query: any = { shop_id };

    // Nếu status không phải 'all', thêm nó vào điều kiện tìm kiếm
    if (status !== 'all' && status !== '') {
      query.status = status;
    }

    // Nếu code không rỗng, thêm nó vào điều kiện tìm kiếm
    if (code !== '' && code !== null) {
      query.code = { $regex: code, $options: 'i' };
    }

    const orders = await this.orderPaginateModel.paginate(query, {
      page,
      limit,
      sort: { created_at: -1 },
      lean: true,
    });
    return orders;
  }

  async findByCode(code: string): Promise<Order> {
    return this.orderModel.findOne({ code }).lean();
  }

  async findByUserId(user_id: string): Promise<Order[]> {
    return this.orderModel.find({ user_id }).exec();
  }

  async updateByCode(code: string, dto: Partial<Order>): Promise<Order> {
    return this.orderModel.findOneAndUpdate(
      {
        code,
      },
      dto,
      {
        new: true,
      },
    );
  }
}
