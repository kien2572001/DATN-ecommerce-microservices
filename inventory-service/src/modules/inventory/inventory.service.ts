import {Injectable} from "@nestjs/common";
import {InventoryRepository} from "./repository/inventory.repository";
import {InjectRedis} from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

export interface CacheInventory {
  quantity: number;
  price: number;
  discount: number;
  discount_price: number;
}

@Injectable()
export class InventoryService {
  private readonly redisClient: Redis;

  constructor(
    private readonly inventoryRepository: InventoryRepository,
    @InjectRedis() private readonly client: Redis
  ) {
    this.redisClient = client;
  }

  async getInventory() {
    const inventories: Array<any> = await this.inventoryRepository.find();

    for (let i = 0; i < inventories.length; i++) {
      inventories[i] = await this.getInventoryFromCache(inventories[i]);
    }
    return inventories;
  }

  async getInventoryById(id: number) {
    return await this.inventoryRepository.findOne({
      where: {
        inventory_id: id
      }
    });
  }

  async getInventoriesByProductId(productId: string) {
    let inventories = await this.inventoryRepository.find({
      where: {
        product_id: productId
      }
    });
    for (let i = 0; i < inventories.length; i++) {
      inventories[i] = await this.getInventoryFromCache(inventories[i]);
    }
    return inventories;
  }

  async createInventory(inventory: any) {
    return await this.inventoryRepository.save(inventory);
  }

  async updateInventory(id: number, inventory: any) {
    return await this.inventoryRepository.update(id, inventory);
  }

  async deleteInventory(id: number) {
    return await this.inventoryRepository.delete(id);
  }

  async createManyInventories(inventories: any[]) {
    let newInventories = [];
    for (let inventory of inventories) {
      let databaseInventory = {
        product_id: inventory.product_id,
        classification_main_id: inventory.classification_main_id,
        classification_sub_id: inventory.classification_sub_id,
        thumbnail: inventory.thumbnail,
      };
      newInventories.push(databaseInventory);
    }
    const startTime = process.hrtime();
    const createdInventories = await this.inventoryRepository.save(newInventories);
    const endTime = process.hrtime(startTime); // End time measurement
    for (let i = 0; i < createdInventories.length; i++) {
      const cacheData: CacheInventory = {
        quantity: inventories[i].quantity,
        price: inventories[i].price,
        discount: inventories[i].discount,
        discount_price: inventories[i].discount_price,
      };
      const cacheKey = `inventory_${createdInventories[i].inventory_id}`;
      const rs = await this.redisClient.set(cacheKey, JSON.stringify(cacheData));
      createdInventories[i] = await this.getInventoryFromCache(createdInventories[i]);
    }
    return createdInventories;
  }

  private async getInventoryFromCache(inventory: any) {
    const cacheKey = `inventory_${inventory.inventory_id}`
    const cacheData: any = JSON.parse(await this.redisClient.get(cacheKey));
    inventory.quantity = cacheData?.quantity || 0;
    inventory.price = cacheData?.price || 0;
    inventory.discount = cacheData?.discount || 0;
    inventory.discount_price = cacheData?.discount_price || 0;
    return inventory;
  }
}