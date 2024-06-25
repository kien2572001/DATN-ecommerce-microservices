import { Injectable, Inject } from '@nestjs/common';
import { FlashSaleRepository } from './flashsale.repository';
import { CreateFlashSaleDto } from './dtos/flashsale.create.dto';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { ClientKafka } from '@nestjs/microservices';
@Injectable()
export class FlashSaleService {
  private readonly inventoryServiceUrl: string;
  private readonly productServiceUrl: string;
  constructor(
    private readonly flashSaleRepository: FlashSaleRepository,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject('FLASH_SALE_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {
    this.inventoryServiceUrl = this.configService.get('inventory_service_url');
    this.productServiceUrl = this.configService.get('product_service_url');
  }

  //this function in in start flash sale worker
  async startFlashSale(time_start: Date, time_end: Date) {
    const flashSales =
      await this.flashSaleRepository.getListActiveFlashSaleByStartTime(
        time_start,
      );
    const listInventories = [];
    for (let i = 0; i < flashSales.length; i++) {
      for (let j = 0; j < flashSales[i].products.length; j++) {
        const items = flashSales[i].products[j].items;
        for (let k = 0; k < items.length; k++) {
          listInventories.push(items[k]);
        }
      }
    }
    //console.log('listInventories', listInventories);
    const initFlashSale = await this.initFlashSale(
      listInventories,
      time_start,
      time_end,
    );
    //console.log('initFlashSale', initFlashSale);
  }

  async initFlashSale(inventories, startTime, endTime) {
    try {
      const response = await this.httpService.axiosRef({
        method: 'post',
        url: this.inventoryServiceUrl + '/public/inventory/init-flash-sale',
        data: {
          inventories,
          startTime,
          endTime,
        },
      });

      return response.data.data;
    } catch (err) {
      console.error(err);
      return false;
    }
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
    const listInventories = [];
    for (let i = 0; i < createFlashSaleDto.products.length; i++) {
      const items = createFlashSaleDto.products[i].items;
      for (let j = 0; j < items.length; j++) {
        //console.log('items[j]', items[j]);
        listInventories.push({
          inventory_id: items[j].inventory_id,
          quantity: items[j].flash_sale_quantity,
          price: items[j].price,
        });
      }
    }
    const isInventoryAvailable =
      await this.checkInventoryAvailabilityAndDeduct(listInventories);
    if (!isInventoryAvailable) {
      throw new Error('Inventory not available');
    }
    const flashSale = await this.flashSaleRepository.create(createFlashSaleDto);
    this.kafkaClient.emit('flash-sale.created', {
      _id: flashSale._id.toString(),
    });
    return flashSale;
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
    const inventoryList = [];
    const flashSale = await this.flashSaleRepository.findOneById(id);
    for (let i = 0; i < flashSale.products.length; i++) {
      const items = flashSale.products[i].items;
      for (let j = 0; j < items.length; j++) {
        inventoryList.push({
          inventory_id: items[j].inventory_id,
          quantity: items[j].flash_sale_quantity,
        });
      }
    }
    const isInventoryReturned =
      await this.returnInventoriesInCaseOfFlashSaleFailure(inventoryList);
    if (!isInventoryReturned) {
      throw new Error('Inventory not returned');
    }
    this.kafkaClient.emit('flash-sale.deleted', {
      _id: id,
    });
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
      console.log('products', products);

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
    const update = await this.flashSaleRepository.update(
      id,
      updateFlashSaleDto,
    );
    this.kafkaClient.emit('flash-sale.updated', {
      _id: id,
    });
    return update;
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
