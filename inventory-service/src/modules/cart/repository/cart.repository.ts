import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { CartDto } from '../dtos/cart.dto';
import { CartItemDto } from '../dtos/cart-item.dto';

@Injectable()
export class CartRepository {
  private readonly redisClient: Redis;

  constructor(@InjectRedis() private readonly client: Redis) {
    this.redisClient = client;
  }

  // Tạo giỏ hàng mới hoặc lấy giỏ hàng hiện tại
  async getOrCreateCart(user_id: string): Promise<CartDto> {
    const existingCart = await this.redisClient.hgetall(`cart:${user_id}`);
    if (Object.keys(existingCart).length === 0) {
      // Giỏ hàng không tồn tại, tạo giỏ hàng mới
      let newCart: CartDto = { id: user_id, items: [] };
      return newCart;
    } else {
      // Giỏ hàng tồn tại, parse các items từ JSON
      let cartItems: CartItemDto[] = [];
      for (const [key, value] of Object.entries(existingCart)) {
        cartItems.push(JSON.parse(value));
      }
      return { id: user_id, items: cartItems };
    }
  }

  async getInventoriesFromCartByShopId(
    user_id: string,
    shop_id: string,
  ): Promise<CartItemDto[]> {
    const cart = await this.getOrCreateCart(user_id);
    return cart.items.filter((item) => item.shop_id === shop_id);
  }

  // Thêm sản phẩm vào giỏ hàng hoặc cập nhật số lượng
  async addInventoryToCart(
    user_id: string,
    inventory: CartItemDto,
  ): Promise<void> {
    const cartKey = `cart:${user_id}`;
    const inventoryKey = `inventory:${inventory.inventory_id}`;
    const inventoryExists = await this.redisClient.exists(inventoryKey);

    if (inventoryExists) {
      // Sản phẩm đã tồn tại, cập nhật số lượng
      let existingInventoryJson = await this.redisClient.hget(
        cartKey,
        inventoryKey,
      );
      let existingInventory: CartItemDto = existingInventoryJson
        ? JSON.parse(existingInventoryJson)
        : {
            inventory_id: inventory.inventory_id,
            product_id: inventory.product_id,
            shop_id: inventory.shop_id,
            quantity: 0,
          };
      // Cập nhật số lượng bằng số lượng mới, không cộng dồn
      existingInventory.quantity = parseInt(String(inventory.quantity), 10);
      await this.redisClient.hset(
        cartKey,
        inventoryKey,
        JSON.stringify(existingInventory),
      );
    } else {
      // Sản phẩm chưa có trong giỏ, thêm mới
      inventory.quantity = parseInt(String(inventory.quantity), 10);
      await this.redisClient.hset(
        cartKey,
        inventoryKey,
        JSON.stringify(inventory),
      );
    }
    // Cập nhật TTL cho giỏ hàng
    // await this.redisClient.expire(cartKey, 3600); // Giữ giỏ hàng trong 1 giờ
  }

  // Ví dụ: Xóa sản phẩm khỏi giỏ hàng
  async removeInventoryFromCart(
    user_id: string,
    inventory_id: number,
  ): Promise<void> {
    await this.redisClient.hdel(`cart:${user_id}`, `inventory:${inventory_id}`);
  }

  // Ví dụ: Xóa giỏ hàng
  async removeCart(user_id: string): Promise<void> {
    await this.redisClient.del(`cart:${user_id}`);
  }
}
