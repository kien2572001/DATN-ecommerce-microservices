import { Inject, Injectable } from '@nestjs/common';
import { InventoryRepository } from './repository/inventory.repository';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { In } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
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
    @Inject('INVENTORY_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {
    this.redisClient = client;
  }

  async initFlashSaleInventory(
    inventories: any[],
    startTime: string,
    endTime: string,
  ) {
    const pipeline = this.redisClient.pipeline();
    const oldValuesArray = [];

    const startTimeNumber = new Date(startTime).getTime();
    const endTimeNumber = new Date(endTime).getTime();

    // Thêm các lệnh hgetall vào pipeline để lấy giá trị cũ
    for (let i = 0; i < inventories.length; i++) {
      const inventory = inventories[i];
      const cacheKey = `inventory:${inventory.inventory_id}`;
      pipeline.hgetall(cacheKey);
    }

    // Thực thi pipeline để lấy kết quả cho tất cả các lệnh hgetall
    const results = await pipeline.exec();

    // Thực hiện cập nhật và tạo mảng giá trị cũ trong một vòng lặp
    for (let i = 0; i < inventories.length; i++) {
      const inventory = inventories[i];
      const cacheKey = `inventory:${inventory.inventory_id}`;
      const oldValues = results[i][1]; // Lấy giá trị trả về từ lệnh hgetall

      // Tạo đối tượng giá trị cũ
      const oldValue = {
        inventory_id: inventory.inventory_id,
        flash_sale_price: oldValues['flash_sale_price'],
        flash_sale_percentage: oldValues['flash_sale_percentage'],
        flash_sale_quantity: oldValues['flash_sale_quantity'],
        flash_sale_start_time: oldValues['flash_sale_start_time'],
        flash_sale_end_time: oldValues['flash_sale_end_time'],
      };
      oldValuesArray.push(oldValue);

      // Thêm các lệnh hset vào pipeline để cập nhật giá trị mới
      pipeline.hset(cacheKey, 'flash_sale_price', inventory.flash_sale_price);
      pipeline.hset(
        cacheKey,
        'flash_sale_percentage',
        inventory.flash_sale_percentage,
      );
      pipeline.hset(
        cacheKey,
        'flash_sale_quantity',
        inventory.flash_sale_quantity,
      );
      pipeline.hset(cacheKey, 'flash_sale_start_time', startTimeNumber);
      pipeline.hset(cacheKey, 'flash_sale_end_time', endTimeNumber);
    }

    // Thực thi pipeline để cập nhật các giá trị mới
    const result = await pipeline.exec();

    // In ra mảng các giá trị cũ
    console.log('oldValuesArray:', oldValuesArray);

    // Gửi sự kiện khi số lượng flash sale inventory lớn hơn 0
    // for (const oldValue of oldValuesArray) {
    //   if (oldValue.flash_sale_quantity > 0) {
    //     this.kafkaClient.emit('inventory.flash_sale.end', oldValue);
    //   }
    // }

    return result;
  }

  async purchaseInventories(inventories: any[]) {
    //console.log('Purchasing inventories:', inventories);
    const keys = inventories.map((i) => `inventory:${i.inventory_id}`);
    const time = new Date().getTime();
    const args = [inventories.length, time.toString()];
    for (let i = 0; i < inventories.length; i++) {
      args.push(inventories[i].quantity.toString());
      args.push(inventories[i].price.toString());
    }
    const luaScript = `
      local numInventories = tonumber(ARGV[1])
      redis.log(redis.LOG_NOTICE, "Number of inventories: " .. numInventories)
      local current_time_ms = tonumber(ARGV[2])
      redis.log(redis.LOG_NOTICE, "Time: " .. current_time_ms)
      local inventories = {}

      for i = 1, numInventories do
          local quantity = tonumber(ARGV[2 * i + 1])
          redis.log(redis.LOG_NOTICE, "Quantity: " .. quantity)
          local price = tonumber(ARGV[2 * i + 2])
          redis.log(redis.LOG_NOTICE, "Price: " .. price)
          table.insert(inventories, { quantity = quantity, price = price })
      end

      for i = 1, #inventories do
          local start_time = redis.call("HGET", KEYS[i], "flash_sale_start_time")
          local end_time = redis.call("HGET", KEYS[i], "flash_sale_end_time")
          local flash_sale_quantity = redis.call("HGET", KEYS[i], "flash_sale_quantity")
          local price
          local quantity
          redis.call("SET", "check_flash_sale_ongoing:" .. KEYS[i], "0")
          if start_time and end_time and flash_sale_quantity then
              start_time = tonumber(start_time)
              end_time = tonumber(end_time)
              flash_sale_quantity = tonumber(flash_sale_quantity)
              local now = current_time_ms
              if now >= start_time and now <= end_time and flash_sale_quantity > 0 then        
                  price = redis.call("HGET", KEYS[i], "flash_sale_price")
                  if not price then
                      return 0
                  end
                  price = tonumber(price)

                  quantity = flash_sale_quantity
                  redis.call("SET", "check_flash_sale_ongoing:" .. KEYS[i], "1")                  
              end
          end

          local is_flash_sale_ongoing = redis.call("GET", "check_flash_sale_ongoing:" .. KEYS[i])

          if is_flash_sale_ongoing == "0" then
              price = redis.call("HGET", KEYS[i], "price")
              if not price then
                  return 0
              end
              price = tonumber(price)

              quantity = redis.call("HGET", KEYS[i], "quantity")
              if not quantity then
                  return 0
              end
              quantity = tonumber(quantity)
          end

          if inventories[i].price < price then
              return 0
          end

          if quantity < inventories[i].quantity then
              return 0
          end
      end

      for i = 1, #inventories do
          local check_flash_sale_ongoing = redis.call("GET", "check_flash_sale_ongoing:" .. KEYS[i])
          if check_flash_sale_ongoing == "1" then
              local quantity = redis.call("HGET", KEYS[i], "flash_sale_quantity")
              quantity = tonumber(quantity)
              quantity = quantity - inventories[i].quantity
              redis.call("HSET", KEYS[i], "flash_sale_quantity", tostring(quantity))
          elseif check_flash_sale_ongoing == "0" then
              local quantity = redis.call("HGET", KEYS[i], "quantity")
              quantity = tonumber(quantity)
              quantity = quantity - inventories[i].quantity
              redis.call("HSET", KEYS[i], "quantity", tostring(quantity))
          end
      end

      return 1`;

    // Gọi Lua script trên Redis
    const result = await this.redisClient.eval(
      luaScript,
      keys.length,
      ...keys,
      ...args,
    );
    if (result === 1) {
      return true;
    } else {
      throw new Error('Failed to purchase inventories');
    }
  }

  async returnInventories(inventories: any[]) {
    console.log('Returning inventories:', inventories);
    const keys = inventories.map((i) => `inventory:${i.inventory_id}`);
    const args = [inventories.length];
    for (let i = 0; i < inventories.length; i++) {
      args.push(inventories[i].quantity); // Thêm quantity vào args
    }

    const luaScript = `
      local numInventories = tonumber(ARGV[1])
      local inventories = {}
      
      for i = 1, numInventories do
          local inventory_id = KEYS[i]
          local quantity = tonumber(ARGV[i + 1]) -- Thay đổi vị trí của ARGV
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

  async getInventoriesByProductIds(productIds: string[]) {
    let inventories = await this.inventoryRepository.find({
      where: {
        product_id: In(productIds),
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
    const createdInventories =
      await this.inventoryRepository.save(newInventories);
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
      // await this.redisClient.hset(
      //   `inventory:${inventory.inventory_id}`,
      //   'discount',
      //   discountString,
      // );
      // await this.redisClient.hset(
      //   `inventory:${inventory.inventory_id}`,
      //   'discount_price',
      //   discountPriceString,
      // );

      // Truy xuất dữ liệu từ Redis và cập nhật lại createdInventories
      createdInventories[i] = await this.getInventoryFromCache(inventory);
    }
    return createdInventories;
  }

  private async getInventoryFromCache(inventory: any) {
    const cacheKey = `inventory:${inventory.inventory_id}`;
    //console.log('Getting inventory from cache:', cacheKey);
    const cacheData: any = await this.redisClient.hgetall(cacheKey);
    //console.log('Cache data:', cacheData);
    if (cacheData) {
      // Cập nhật các trường của inventory từ cacheData nếu có
      inventory.quantity = Number(cacheData['quantity']) || 0;
      inventory.price = Number(cacheData['price']) || 0;
      inventory.discount = Number(cacheData['discount']) || 0;
      inventory.discount_price = Number(cacheData['discount_price']) || 0;
      inventory.flash_sale_price = Number(cacheData['flash_sale_price']) || 0;
      inventory.flash_sale_quantity =
        Number(cacheData['flash_sale_quantity']) || 0;
      inventory.flash_sale_start_time =
        cacheData['flash_sale_start_time'] || '';
      inventory.flash_sale_end_time = cacheData['flash_sale_end_time'] || '';
    } else {
      // Nếu không tìm thấy dữ liệu trong Redis, set các trường về giá trị mặc định
      inventory.quantity = 0;
      inventory.price = 0;
      inventory.discount = 0;
      inventory.discount_price = 0;
      inventory.flash_sale_price = 0;
      inventory.flash_sale_quantity = 0;
      inventory.flash_sale_start_time = '';
      inventory.flash_sale_end_time = '';
    }
    return inventory;
  }

  async updateFlashSalePriceAndQuantityAndTime(
    inventoryId: number,
    flash_sale_price: number,
    flash_sale_quantity: number,
    flash_sale_start_time: string,
    flash_sale_end_time: string,
  ) {
    const starTime = new Date(flash_sale_start_time).getTime();
    const endTime = new Date(flash_sale_end_time).getTime();
    console.log('Start time:', starTime);
    console.log('End time:', endTime);
    const cacheKey = `inventory:${inventoryId}`;
    await this.redisClient.hset(
      cacheKey,
      'flash_sale_price',
      flash_sale_price.toString(),
    );
    await this.redisClient.hset(
      cacheKey,
      'flash_sale_quantity',
      flash_sale_quantity.toString(),
    );
    await this.redisClient.hset(
      cacheKey,
      'flash_sale_start_time',
      starTime.toString(),
    );
    await this.redisClient.hset(
      cacheKey,
      'flash_sale_end_time',
      endTime.toString(),
    );
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
