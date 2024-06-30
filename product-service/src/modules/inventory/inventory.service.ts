import { Injectable, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CreateInventoryDto } from './dtos/inventory.create.dto';
import { catchError, map, Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InventoryService {
  private readonly inventoryServiceUrl: string;

  constructor(
    @Inject(HttpService) private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.inventoryServiceUrl = this.configService.get('INVENTORY_SERVICE_URL');
  }

  getShardIndex(inputString, numShards = 4) {
    // Lấy ký tự cuối cùng của chuỗi
    const lastChar = inputString.slice(-1);

    // Kiểm tra xem ký tự cuối là số hay chữ cái
    let charValue;
    if (/\d/.test(lastChar)) {
      // Nếu là số, chuyển đổi thành số nguyên
      charValue = parseInt(lastChar, 10);
    } else {
      // Nếu là chữ cái, chuyển thành số thứ tự trong bảng chữ cái
      charValue = lastChar.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0) + 10;
    }

    // Tính toán chỉ số shard bằng phép chia lấy dư
    const shardIndex = charValue % numShards;

    return shardIndex + 1;
  }

  async createInventory(
    inventory: CreateInventoryDto,
    shop_id: string,
  ): Promise<Observable<AxiosResponse<any>>> {
    const shardIndex = this.getShardIndex(shop_id, 4);
    return this.httpService.axiosRef
      .post(this.inventoryServiceUrl + '/public/inventory/create', {
        inventory: inventory,
        shard_index: shardIndex,
      })
      .then((response) => {
        return response.data.data;
      })
      .catch((error) => {
        throw new Error(
          error.message + ': ' + error.response.data.data.message,
        );
      });
  }

  async getInventoriesByProductId(
    productId: string,
  ): Promise<Observable<AxiosResponse<any>>> {
    return this.httpService.axiosRef
      .get(this.inventoryServiceUrl + '/public/inventory/product/' + productId)
      .then((response) => {
        return response.data.data;
      })
      .catch((error) => {
        throw new Error(
          error.message + ': ' + error.response.data.data.message,
        );
      });
  }

  async getInventoriesByProductIds(
    productIds: string[],
  ): Promise<Observable<AxiosResponse<any>>> {
    return this.httpService.axiosRef
      .post(
        this.inventoryServiceUrl + '/public/inventory/product/by-list-ids',
        { ids: productIds },
      )
      .then((response) => {
        return response.data.data;
      })
      .catch((error) => {
        throw new Error(
          error.message + ': ' + error.response.data.data.message,
        );
      });
  }

  async createManyInventories(
    inventories: CreateInventoryDto[],
    shard_id: string,
  ): Promise<Observable<AxiosResponse<any>>> {
    const shardIndex = this.getShardIndex(shard_id, 4);
    return this.httpService.axiosRef
      .post(this.inventoryServiceUrl + '/public/inventory/create-many', {
        inventories: inventories,
        shard_index: shardIndex,
      })
      .then((response) => {
        return response.data.data;
      })
      .catch((error) => {
        throw new Error(
          error.message + ': ' + error.response.data.data.message,
        );
      });
  }

  async updateInventoriesByProductId(
    productId: string,
    inventories: any,
    old_classifications: any,
    new_classifications: any,
  ): Promise<Observable<AxiosResponse<any>>> {
    return this.httpService.axiosRef
      .post(
        this.inventoryServiceUrl + '/public/inventory/product/' + productId,
        {
          inventories: inventories,
          old_classifications: old_classifications,
          new_classifications: new_classifications,
        },
      )
      .then((response) => {
        return response.data.data;
      })
      .catch((error) => {
        throw new Error(
          error.message + ': ' + error.response.data.data.message,
        );
      });
  }
}
