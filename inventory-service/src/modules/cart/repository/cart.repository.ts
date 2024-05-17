import {Injectable} from "@nestjs/common";
import {InjectRedis} from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import {CartDto} from "../dtos/cart.dto";
import {CartItemDto} from "../dtos/cart-item.dto";

@Injectable()
export class CartRepository {
  private readonly redisClient: Redis;

  constructor(
    @InjectRedis() private readonly client: Redis
  ) {
    this.redisClient = client;
  }

  // Tạo giỏ hàng mới hoặc lấy giỏ hàng hiện tại
  async getOrCreateCart(user_id: string): Promise<CartDto> {
    const existingCart = await this.redisClient.hgetall(`cart:${user_id}`);
    if (Object.keys(existingCart).length === 0) {
      // Giỏ hàng không tồn tại, tạo giỏ hàng mới
      let newCart: CartDto = {id: user_id, items: []};
      return newCart;
    } else {
      // Giỏ hàng tồn tại, parse các items từ JSON
      let cartItems: CartItemDto[] = [];
      for (const [key, value] of Object.entries(existingCart)) {
        cartItems.push(JSON.parse(value));
      }
      return {id: user_id, items: cartItems};
    }
  }

  // Thêm sản phẩm vào giỏ hàng hoặc cập nhật số lượng
  async addProductToCart(user_id: string, product: CartItemDto): Promise<void> {
    const cartKey = `cart:${user_id}`;
    const productKey = `product:${product.product_id}`;
    const productExists = await this.redisClient.hexists(cartKey, productKey);

    if (productExists) {
      // Sản phẩm đã tồn tại, cập nhật số lượng
      let existingProductJson = await this.redisClient.hget(cartKey, productKey);
      let existingProduct: CartItemDto = existingProductJson ? JSON.parse(existingProductJson) : {
        product_id: product.product_id,
        shop_id: product.shop_id,
        quantity: 0
      };
      existingProduct.quantity = parseInt(String(existingProduct.quantity), 10) + parseInt(String(product.quantity), 10);
      await this.redisClient.hset(cartKey, productKey, JSON.stringify(existingProduct));
    } else {
      // Sản phẩm chưa có trong giỏ, thêm mới
      product.quantity = parseInt(String(product.quantity), 10);
      await this.redisClient.hset(cartKey, productKey, JSON.stringify(product));
    }
    // Cập nhật TTL cho giỏ hàng
    //await this.redisClient.expire(cartKey, 3600); // Giữ giỏ hàng trong 1 giờ
  }

  // Ví dụ: Xóa sản phẩm khỏi giỏ hàng
  async removeProductFromCart(user_id: string, product_id: string): Promise<void> {
    await this.redisClient.hdel(`cart:${user_id}`, `product:${product_id}`);
  }

  // Ví dụ: Xóa giỏ hàng
  async removeCart(user_id: string): Promise<void> {
    await this.redisClient.del(`cart:${user_id}`);
  }
}
