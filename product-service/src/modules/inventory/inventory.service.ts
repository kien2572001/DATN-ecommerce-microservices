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

  async createInventory(
    inventory: CreateInventoryDto,
  ): Promise<Observable<AxiosResponse<any>>> {
    return this.httpService.axiosRef
      .post(this.inventoryServiceUrl + '/public/inventory/create', inventory)
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

  async createManyInventories(
    inventories: CreateInventoryDto[],
  ): Promise<Observable<AxiosResponse<any>>> {
    return this.httpService.axiosRef
      .post(
        this.inventoryServiceUrl + '/public/inventory/create-many',
        inventories,
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
