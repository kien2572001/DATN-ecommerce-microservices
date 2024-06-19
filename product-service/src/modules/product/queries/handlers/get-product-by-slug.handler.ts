import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ProductRepository } from '../../repository/product.repository';
import { GetProductBySlugQuery } from '../impl/get-product-by-slug.query';
import { InventoryService } from '../../../inventory/inventory.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
@QueryHandler(GetProductBySlugQuery)
export class GetProductBySlugHandler
  implements IQueryHandler<GetProductBySlugQuery>
{
  private readonly orderServiceUrl: string;

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly inventoryService: InventoryService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.orderServiceUrl = this.configService.get('order_service_url');
  }

  async execute(query: GetProductBySlugQuery) {
    let product = await this.productRepository.findOneBySlugWithFullPopulate(
      query.product_slug,
    );
    if (!product) {
      return null;
    }
    // @ts-ignore
    product.inventories = await this.inventoryService.getInventoriesByProductId(
      product._id,
    );
    const flashSaleProduct = await this.getFlashSaleLatestByProductId(
      product._id,
    );
    // @ts-ignore
    product.flash_sale = flashSaleProduct;
    return product;
  }

  async getFlashSaleLatestByProductId(productId: string) {
    try {
      const response = await this.httpService.axiosRef({
        method: 'GET',
        url: `${this.orderServiceUrl}/public/flashsale-product/product/${productId}/latest`,
      });

      return response.data.data;
    } catch (error) {
      return null;
    }
  }
}
