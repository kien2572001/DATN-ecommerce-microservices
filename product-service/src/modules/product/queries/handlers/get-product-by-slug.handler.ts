import {IQueryHandler, QueryHandler} from '@nestjs/cqrs';
import {ProductRepository} from "../../repository/product.repository";
import {GetProductBySlugQuery} from "../impl/get-product-by-slug.query";
import {InventoryService} from "../../../inventory/inventory.service";

@QueryHandler(GetProductBySlugQuery)
export class GetProductBySlugHandler implements IQueryHandler<GetProductBySlugQuery> {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly inventoryService: InventoryService
  ) {
  }

  async execute(query: GetProductBySlugQuery) {
    let product = await this.productRepository.findOneBySlugWithFullPopulate(query.product_slug);
    if (!product) {
      return null;
    }
    // @ts-ignore
    product.inventories = await this.inventoryService.getInventoriesByProductId(product._id);
    return product;
  }
}