import { Injectable } from '@nestjs/common';
import { FlashSaleRepository } from './flashsale.repository';
import { CreateFlashSaleDto } from './dtos/flashsale.create.dto';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
@Injectable()
export class FlashSaleService {
  private readonly inventoryServiceUrl: string;
  private readonly productServiceUrl: string;
  constructor(
    private readonly flashSaleRepository: FlashSaleRepository,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.inventoryServiceUrl = this.configService.get('inventory_service_url');
    this.productServiceUrl = this.configService.get('product_service_url');
  }

  //check is available to flash sale and deduct inventory if available
  async checkInventoryAvailabilityAndDeduct(items: any) {
    try {
      const response = await this.httpService.axiosRef({
        method: 'post',
        url: this.inventoryServiceUrl + '/public/inventory/purchase',
        data: items,
      });

      if (response.data.data) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  //return inventories in case of
  //1.flash sale failure
  //2. cancellation
  //3. end
  async returnInventoriesInCaseOfFlashSaleFailure(items: any) {
    try {
      const response = await this.httpService.axiosRef({
        method: 'post',
        url: this.inventoryServiceUrl + '/public/inventory/return',
        data: items,
      });

      if (response.data.data) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async createFlashSale(createFlashSaleDto: CreateFlashSaleDto) {
    return await this.flashSaleRepository.create(createFlashSaleDto);
  }

  async getFlashSaleByShopIdWithPagination(
    shopId: string,
    page: number,
    limit: number,
  ) {
    return await this.flashSaleRepository.getFlashSaleByShopIdWithPagination(
      shopId,
      page,
      limit,
    );
  }

  async deleteFlashSale(id: string) {
    return await this.flashSaleRepository.permanentlyDelete(id);
  }

  async getFlashSaleById(id: string) {
    const flashSale = await this.flashSaleRepository.findOneById(id);

    if (!flashSale) {
      throw new Error('Flash sale not found');
    }

    try {
      const productPromises = flashSale.products.map(async (productItem) => {
        const product = await this.getProductById(productItem._id);
        return { ...product, ...productItem };
      });

      const products = await Promise.all(productPromises);
      //console.log(products);

      flashSale.products = flashSale.products.map((productItem) => {
        const product = products.find(
          (product) => product._id === productItem._id,
        );
        return { ...product, ...productItem };
      });
      return flashSale;
    } catch (err) {
      console.error(err);
      throw new Error('Error fetching products');
    }
  }

  async updateFlashSale(id: string, updateFlashSaleDto: CreateFlashSaleDto) {
    return await this.flashSaleRepository.update(id, updateFlashSaleDto);
  }

  //support function
  async getProductById(productId: string) {
    try {
      const response = await this.httpService.axiosRef({
        method: 'get',
        url: this.productServiceUrl + '/private/product/id/' + productId,
      });

      return response.data.data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}
