import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProductListForSellerQuery } from '../impl/get-product-list-for-seller.query';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { Product, ProductSchema } from '../../repository/product.schema';
import { InventoryService } from '../../../inventory/inventory.service';
@QueryHandler(GetProductListForSellerQuery)
export class GetProductListForSellerHandler
  implements IQueryHandler<GetProductListForSellerQuery>
{
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: PaginateModel<Product>,
    private readonly inventoryService: InventoryService,
  ) {}

  async execute(query: GetProductListForSellerQuery) {
    const { seller_id, page, limit } = query;
    const products = await this.productModel.paginate(
      { shop_id: seller_id, deleted_at: null },
      {
        page: page || 1,
        limit: limit || 10,
        lean: true,
        //populate: ['category', 'classifications'],
      },
    );
    const listProductIds = products.docs.map((product) =>
      product._id.toString(),
    );
    const inventories: any =
      await this.inventoryService.getInventoriesByProductIds(listProductIds);
    products.docs = products.docs.map((product: any) => {
      let foundInventories = inventories.filter(
        (inventory) => inventory.product_id === product._id.toString(),
      );
      product.inventories = foundInventories;
      return product;
    });
    return products;
  }
}
