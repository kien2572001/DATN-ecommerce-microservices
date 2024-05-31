import { Injectable } from '@nestjs/common';
import { InventoryRepository } from './repository/inventory.repository';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { In } from 'typeorm';

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

  async purchaseInventories(inventories: any[]) {
    return true;
    const keys = inventories.map((i) => `inventory:${i.inventory_id}`);
    const args = [inventories.length];
    for (let i = 0; i < inventories.length; i++) {
      args.push(inventories[i].inventory_id, inventories[i].quantity);
    }
    const luaScript = `
      local numInventories = tonumber(ARGV[1])
      local inventories = {}
      
      for i = 1, numInventories do
          local inventory_id = ARGV[(i - 1) * 2 + 2]
          local quantity = tonumber(ARGV[(i - 1) * 2 + 3])
          table.insert(inventories, { inventory_id = inventory_id, quantity = quantity })
      end
      
      for i = 1, #inventories do
          local quantity = redis.call("HGET", KEYS[i], "quantity")
          if not quantity then
              return 0
          end
          quantity = tonumber(quantity)
          if quantity < inventories[i].quantity then
              return 0
          end
      end
      
      for i = 1, #inventories do
          local quantity = redis.call("HGET", KEYS[i], "quantity")
          quantity = tonumber(quantity)
          quantity = quantity - inventories[i].quantity
          redis.call("HSET", KEYS[i], "quantity", tostring(quantity))
      end
      
      return 1
    `;

    // Gọi Lua script trên Redis
    const result = await this.redisClient.eval(
      luaScript,
      keys.length,
      ...keys,
      ...args,
    );
    console.log('Result:', result);
    if (result === 1) {
      return true;
    } else {
      throw new Error('Failed to purchase inventories');
    }
  }

  async returnInventories(inventories: any[]) {
    const keys = inventories.map((i) => `inventory:${i.inventory_id}`);
    const args = [inventories.length];
    for (let i = 0; i < inventories.length; i++) {
      args.push(inventories[i].inventory_id, inventories[i].quantity);
    }

    const luaScript = `
      local numInventories = tonumber(ARGV[1])
      local inventories = {}
      
      for i = 1, numInventories do
          local inventory_id = ARGV[(i - 1) * 2 + 2]
          local quantity = tonumber(ARGV[(i - 1) * 2 + 3])
          table.insert(inventories, { inventory_id = inventory_id, quantity = quantity })
      end

      for i = 1, #inventories do
          local quantity = redis.call("HGET", KEYS[i], "quantity")
          quantity = tonumber(quantity)
          quantity = quantity + inventories[i].quantity
          redis.call("HSET", KEYS[i], "quantity", tostring(quantity))
      end
      
      return 1
    `;

    // Gọi Lua script trên Redis
    const result = await this.redisClient.eval(
      luaScript,
      keys.length,
      ...keys,
      ...args,
    );
    console.log('Result:', result);
    if (result === 1) {
      return true;
    } else {
      throw new Error('Failed to return inventories');
    }
  }

  async getInventory() {
    const inventories: Array<any> = await this.inventoryRepository.find();

    for (let i = 0; i < inventories.length; i++) {
      inventories[i] = await this.getInventoryFromCache(inventories[i]);
    }
    return inventories;
  }

  async getInventoryByListIds(ids: number[]) {
    const inventories = await this.inventoryRepository.find({
      where: {
        inventory_id: In(ids),
      },
    });
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

    // Lưu thông tin của inventory vào cơ sở dữ liệu
    const createdInventory =
      await this.inventoryRepository.save(databaseInventory);

    // Lưu thông tin của inventory vào Redis dưới dạng hash set
    const cacheKey = `inventory:${createdInventory.inventory_id}`;
    await this.redisClient.hset(
      cacheKey,
      'price',
      inventory.price?.toString() || '0',
    );
    await this.redisClient.hset(
      cacheKey,
      'quantity',
      inventory.quantity?.toString() || '0',
    );
    await this.redisClient.hset(cacheKey, 'price', inventory.price.toString());
    await this.redisClient.hset(
      cacheKey,
      'discount',
      inventory.discount?.toString() || '0',
    );
    await this.redisClient.hset(
      cacheKey,
      'discount_price',
      inventory.discount_price?.toString() || '0',
    );

    // Trả về thông tin của inventory từ Redis
    return await this.getInventoryFromCache(createdInventory);
  }

  async updateInventory(id: number, inventory: any) {
    return await this.inventoryRepository.update(id, inventory);
  }

  async deleteInventory(id: number) {
    const cacheKey = `inventory:${id}`;
    await this.redisClient.del(cacheKey);
    return await this.inventoryRepository.delete(id);
  }

  async createManyInventories(inventories: any[]) {
    console.log('Creating many inventories');
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
    console.log(
      'Time to save inventories to database: %ds %dms',
      endTime[0],
      endTime[1] / 1000000,
    );
    for (let i = 0; i < createdInventories.length; i++) {
      const inventory = createdInventories[i];

      // Chuyển đổi số thành chuỗi trước khi lưu vào Redis
      const quantityString = inventories[i].quantity?.toString() || '0';
      const priceString = inventories[i].price?.toString() || '0';
      const discountString = inventories[i].discount?.toString() || '0';
      const discountPriceString =
        inventories[i].discount_price?.toString() || '0';

      // Lưu từng trường của inventory vào Redis với cấu trúc hash set
      await this.redisClient.hset(
        `inventory:${inventory.inventory_id}`,
        'quantity',
        quantityString,
      );
      await this.redisClient.hset(
        `inventory:${inventory.inventory_id}`,
        'price',
        priceString,
      );
      await this.redisClient.hset(
        `inventory:${inventory.inventory_id}`,
        'discount',
        discountString,
      );
      await this.redisClient.hset(
        `inventory:${inventory.inventory_id}`,
        'discount_price',
        discountPriceString,
      );

      // Truy xuất dữ liệu từ Redis và cập nhật lại createdInventories
      createdInventories[i] = await this.getInventoryFromCache(inventory);
    }
    return createdInventories;
  }

  private async getInventoryFromCache(inventory: any) {
    const cacheKey = `inventory:${inventory.inventory_id}`;
    console.log('Getting inventory from cache:', cacheKey);
    const cacheData: any = await this.redisClient.hgetall(cacheKey);
    console.log('Cache data:', cacheData);
    if (cacheData) {
      // Cập nhật các trường của inventory từ cacheData nếu có
      inventory.quantity = Number(cacheData['quantity']) || 0;
      inventory.price = Number(cacheData['price']) || 0;
      inventory.discount = Number(cacheData['discount']) || 0;
      inventory.discount_price = Number(cacheData['discount_price']) || 0;
    } else {
      // Nếu không tìm thấy dữ liệu trong Redis, set các trường về giá trị mặc định
      inventory.quantity = 0;
      inventory.price = 0;
      inventory.discount = 0;
      inventory.discount_price = 0;
    }
    return inventory;
  }

  async deleteInventoriesByProductId(productId: string) {
    const inventories = await this.inventoryRepository.find({
      where: {
        product_id: productId,
      },
    });
    for (let i = 0; i < inventories.length; i++) {
      const cacheKey = `inventory:${inventories[i].inventory_id}`;
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
    // const inventory = await this.inventoryRepository.findOne({
    //   where: {
    //     inventory_id: inventoryId,
    //   },
    // });
    const cacheKey = `inventory:${inventoryId}`;
    await this.redisClient.hset(cacheKey, 'price', price.toString());
    await this.redisClient.hset(cacheKey, 'quantity', quantity.toString());
  }

  async updateInventoryByProductId(
    productId,
    inventories,
    old_classifications = [],
    new_classifications = [],
  ) {
    // console.log('Updating inventories by product id');
    // console.log('Product id:', productId);
    // console.log('Inventories:', inventories);
    // console.log('Old classifications:', old_classifications);
    // console.log('New classifications:', new_classifications);

    const deleteOldAndCreateNewInventories = async (productId, inventories) => {
      await this.deleteInventoriesByProductId(productId);
      let newInventories = await this.createManyInventories(inventories);
      return newInventories;
    };

    //case 0: if new classification and old classification are empty
    if (new_classifications.length === 0 && old_classifications.length === 0) {
      let oldInventory = await this.getInventoriesByProductId(productId);
      await this.updatePriceAndQuantity(
        oldInventory[0].inventory_id,
        inventories.price,
        inventories.quantity,
      );
    }

    // Case 1: if new classification is empty, inventories = inventory
    if (new_classifications.length === 0 && old_classifications.length !== 0) {
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
      else if (new_classifications.length === 2) {
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

        return true;
      }
    }
  }
}
