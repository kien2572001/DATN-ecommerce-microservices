import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProductListForSellerQuery } from '../impl/get-product-list-for-seller.query';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { Product, ProductSchema } from '../../repository/product.schema';

@QueryHandler(GetProductListForSellerQuery)
export class GetProductListForSellerHandler
  implements IQueryHandler<GetProductListForSellerQuery>
{
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: PaginateModel<Product>,
  ) {}

  async execute(query: GetProductListForSellerQuery) {
    const { seller_id, page, limit } = query;
    const products = await this.productModel.paginate(
      { shop_id: seller_id, deleted_at: null },
      {
        page: page || 1,
        limit: limit || 10,
        //populate: ['category', 'classifications'],
      },
    );
    return products;
  }
}
