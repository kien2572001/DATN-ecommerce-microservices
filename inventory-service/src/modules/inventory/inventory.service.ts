import { Injectable } from '@nestjs/common';
import { InventoryRepository } from './repository/inventory.repository';
import { InjectRedis } from '@nestjs-modules/ioredis';
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
    @InjectRedis() private readonly client: Redis,
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
    const inventory = await this.inventoryRepository.findOne({
      where: {
        inventory_id: id,
      },
    });
    return await this.getInventoryFromCache(inventory);
  }

  async getInventoriesByProductId(productId: string) {
    let inventories = await this.inventoryRepository.find({
      where: {
        product_id: productId,
      },
    });
    for (let i = 0; i < inventories.length; i++) {
      inventories[i] = await this.getInventoryFromCache(inventories[i]);
    }
    return inventories;
  }

  async createInventory(inventory: any) {
    const databaseInventory = {
      product_id: inventory.product_id,
      classification_main_id: inventory.classification_main_id,
      classification_sub_id: inventory.classification_sub_id,
      thumbnail: inventory.thumbnail,
    };
    const createdInventory =
      await this.inventoryRepository.save(databaseInventory);
    const cacheData: CacheInventory = {
      quantity: inventory.quantity,
      price: inventory.price,
      discount: inventory.discount,
      discount_price: inventory.discount_price,
    };
    const cacheKey = `inventory_${createdInventory.inventory_id}`;
    await this.redisClient.set(cacheKey, JSON.stringify(cacheData));
    return await this.getInventoryFromCache(createdInventory);
  }

  async updateInventory(id: number, inventory: any) {
    return await this.inventoryRepository.update(id, inventory);
  }

  async deleteInventory(id: number) {
    const cacheKey = `inventory_${id}`;
    await this.redisClient.del(cacheKey);
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
    const createdInventories =
      await this.inventoryRepository.save(newInventories);
    const endTime = process.hrtime(startTime); // End time measurement
    for (let i = 0; i < createdInventories.length; i++) {
      const cacheData: CacheInventory = {
        quantity: inventories[i].quantity,
        price: inventories[i].price,
        discount: inventories[i].discount,
        discount_price: inventories[i].discount_price,
      };
      const cacheKey = `inventory_${createdInventories[i].inventory_id}`;
      const rs = await this.redisClient.set(
        cacheKey,
        JSON.stringify(cacheData),
      );
      createdInventories[i] = await this.getInventoryFromCache(
        createdInventories[i],
      );
    }
    return createdInventories;
  }

  private async getInventoryFromCache(inventory: any) {
    const cacheKey = `inventory_${inventory.inventory_id}`;
    const cacheData: any = JSON.parse(await this.redisClient.get(cacheKey));
    inventory.quantity = Number(cacheData?.quantity) || 0;
    inventory.price = Number(cacheData?.price) || 0;
    inventory.discount = Number(cacheData?.discount) || 0;
    inventory.discount_price = Number(cacheData?.discount_price) || 0;
    return inventory;
  }

  async deleteInventoriesByProductId(productId: string) {
    const inventories = await this.inventoryRepository.find({
      where: {
        product_id: productId,
      },
    });
    for (let i = 0; i < inventories.length; i++) {
      const cacheKey = `inventory_${inventories[i].inventory_id}`;
      await this.redisClient.del(cacheKey);
    }
    return await this.inventoryRepository.delete({
      product_id: productId,
    });
  }

  async updatePriceAndQuantity(
    inventoryId: number,
    price: number,
    quantity: number,
  ) {
    const inventory = await this.inventoryRepository.findOne({
      where: {
        inventory_id: inventoryId,
      },
    });
    const cacheKey = `inventory_${inventoryId}`;
    const data = JSON.parse(await this.redisClient.get(cacheKey));
    data.price = Number(price);
    data.quantity = Number(quantity);
    await this.redisClient.set(cacheKey, JSON.stringify(data));
  }

  async updateInventoryByProductId(
    productId,
    inventories,
    old_classifications = [],
    new_classifications = [],
  ) {
    console.log('Updating inventories by product id');
    console.log('Product id:', productId);
    console.log('Inventories:', inventories);
    console.log('Old classifications:', old_classifications);
    console.log('New classifications:', new_classifications);

    const deleteOldAndCreateNewInventories = async (productId, inventories) => {
      await this.deleteInventoriesByProductId(productId);
      let newInventories = await this.createManyInventories(inventories);
      return newInventories;
    };

    // Case 1: if new classification is empty, inventories = inventory
    if (new_classifications.length === 0) {
      await this.deleteInventoriesByProductId(productId);
      let newInventory = await this.createInventory(inventories);
      return newInventory;
    }
    // Case 2: if new classification's length != old classification's length
    else if (new_classifications.length !== old_classifications.length) {
      return await deleteOldAndCreateNewInventories(productId, inventories);
    }
    // Case 3: if new classification's length == old classification's length
    else if (new_classifications.length === old_classifications.length) {
      // Case 3.1: if new classification's length == 1
      if (new_classifications.length === 1) {
        // Case 3.1.1: if new classification's id != old classification's id
        if (new_classifications[0]._id !== old_classifications[0]._id) {
          return await deleteOldAndCreateNewInventories(productId, inventories);
        }
        // Case 3.1.2: if new classification's id == old classification's id
        else {
          let oldInventory = await this.getInventoriesByProductId(productId);

          let toCreate = [];
          let toUpdate = [];
          let toDelete = [];

          // Find items to update and delete
          for (let oldItem of oldInventory) {
            let matched = inventories.find(
              (newItem) =>
                newItem.classification_main_id._id ===
                oldItem.classification_main_id,
            );
            if (matched) {
              toUpdate.push({
                inventory_id: oldItem.inventory_id,
                price: matched.price,
                quantity: matched.quantity,
              });
            } else {
              toDelete.push(oldItem);
            }
          }

          // Find items to create
          for (let newItem of inventories) {
            let matched = oldInventory.find(
              (oldItem) =>
                oldItem.classification_main_id ===
                newItem.classification_main_id._id,
            );
            if (!matched) {
              toCreate.push(newItem);
            }
          }

          // Perform the necessary updates, deletions, and creations
          for (let item of toDelete) {
            await this.deleteInventory(item.inventory_id);
          }
          for (let item of toUpdate) {
            await this.updatePriceAndQuantity(
              item.inventory_id,
              item.price,
              item.quantity,
            );
          }
          await this.createManyInventories(toCreate);
          return true;
        }
      }
      // Case 3.2: if new classification's length = 2
      else {
        for (let i = 0; i < new_classifications.length; i++) {
          if (new_classifications[i]._id !== old_classifications[i]._id) {
            return await deleteOldAndCreateNewInventories(
              productId,
              inventories,
            );
          }
        }

        let oldInventory = await this.getInventoriesByProductId(productId);

        let toCreate = [];
        let toUpdate = [];
        let toDelete = [];

        // Find items to update and delete
        for (let oldItem of oldInventory) {
          let matched = inventories.find(
            (newItem) =>
              newItem.classification_main_id._id ===
                oldItem.classification_main_id &&
              newItem.classification_sub_id._id ===
                oldItem.classification_sub_id,
          );
          if (matched) {
            toUpdate.push({
              inventory_id: oldItem.inventory_id,
              price: matched.price,
              quantity: matched.quantity,
            });
          } else {
            toDelete.push(oldItem);
          }
        }

        // Find items to create
        for (let newItem of inventories) {
          let matched = oldInventory.find(
            (oldItem) =>
              oldItem.classification_main_id ===
                newItem.classification_main_id._id &&
              oldItem.classification_sub_id ===
                newItem.classification_sub_id._id,
          );
          if (!matched) {
            toCreate.push(newItem);
          }
        }

        // Perform the necessary updates, deletions, and creations
        for (let item of toDelete) {
          await this.deleteInventory(item.inventory_id);
        }
        for (let item of toUpdate) {
          await this.updatePriceAndQuantity(
            item.inventory_id,
            item.price,
            item.quantity,
          );
        }
        await this.createManyInventories(toCreate);

        return { updated: toUpdate, deleted: toDelete, created: toCreate };
      }
    }
  }
}
