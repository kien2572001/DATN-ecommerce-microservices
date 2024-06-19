import { Injectable } from '@nestjs/common';
import { FlashSaleProductRepository } from './flashsale-product.repository';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { FlashSaleRepository } from './flashsale.repository';
@Injectable()
export class FlashSaleProductService {
  private readonly inventoryServiceUrl: string;
  private readonly productServiceUrl: string;
  constructor(
    private readonly flashSaleProductRepository: FlashSaleProductRepository,
    private readonly flashSaleRepository: FlashSaleRepository,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.inventoryServiceUrl = this.configService.get('inventory_service_url');
    this.productServiceUrl = this.configService.get('product_service_url');
  }

  async getFlashSaleProductByFlashSaleId(flashSaleId: string) {
    return this.flashSaleProductRepository.findOneById(flashSaleId);
  }

  async getFlashSaleProductByProductId(productId: string) {
    return this.flashSaleProductRepository.getLatestFlashSaleProductByProductId(
      productId,
    );
  }

  async getLatestFlashSaleProductByProductId(productId: string) {
    const flashSaleProduct =
      await this.flashSaleProductRepository.findOneByCondition({
        product_id: productId,
        time_start: { $gte: new Date() },
      });
    if (!flashSaleProduct) {
      return null;
    }
    return flashSaleProduct;
  }

  async handleFlashSaleCreateEvent(flashSaleId: string) {
    // console.log('Flash sale created:', flashSaleId);
    const flashSale = await this.flashSaleRepository.findOneById(flashSaleId);
    const flashSaleProducts = flashSale.products.map((product: any) => {
      return {
        flash_sale_id: flashSale._id.toString(),
        product_id: product._id,
        time_start: flashSale.time_start,
        time_end: flashSale.time_end,
        is_active: flashSale.is_active,
        items: product.items,
      };
    });
    await this.flashSaleProductRepository.createMany(flashSaleProducts);
    console.log(
      'Flash sale products created successfully:',
      flashSale._id.toString(),
    );
  }

  async handleFlashSaleUpdateEvent(flashSaleId: string) {
    await this.flashSaleProductRepository.deleteManyByFlashSaleId(flashSaleId);
    const flashSale = await this.flashSaleRepository.findOneById(flashSaleId);
    if (!flashSale) {
      throw new Error('Flash sale not found');
    }
    await this.handleFlashSaleCreateEvent(flashSaleId);
    console.log('Flash sale products updated successfully:', flashSaleId);
  }

  async handleFlashSaleDeleteEvent(flashSaleId: string) {
    // console.log('Deleting flash sale products:', flashSaleId);
    const deletedFlashSaleProducts =
      await this.flashSaleProductRepository.deleteManyByFlashSaleId(
        flashSaleId,
      );
    // if (!deletedFlashSaleProducts) {
    //   throw new Error('Failed to delete flash sale products');
    // }
    console.log('Flash sale products deleted successfully:', flashSaleId);
  }
}
