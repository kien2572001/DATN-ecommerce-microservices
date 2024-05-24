import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ProductRepository } from '../../repository/product.repository';
import { GetProductByIdQuery } from '../impl/get-product-by-id.query';
import { InventoryService } from '../../../inventory/inventory.service';

@QueryHandler(GetProductByIdQuery)
export class GetProductByIdHandler
  implements IQueryHandler<GetProductByIdQuery>
{
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly inventoryService: InventoryService,
  ) {}

  async execute(query: GetProductByIdQuery) {
    let product = await this.productRepository.findOneByIdWithFullPopulate(
      query.product_id,
    );
    if (!product) {
      return null;
    }
    // @ts-ignore
    product.inventories = await this.inventoryService.getInventoriesByProductId(
      product._id,
    );
    return product;
  }
}
