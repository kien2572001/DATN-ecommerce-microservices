import { InventoryService } from 'src/modules/inventory/inventory.service';
import { Injectable } from '@nestjs/common';
import { CartRepository } from './repository/cart.repository';
import { CartDto } from './dtos/cart.dto';
import { CartItemDto } from './dtos/cart-item.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CartService {
  private readonly productServiceUrl: string;
  private readonly userServiceUrl: string;

  constructor(
    private readonly cartRepository: CartRepository,
    private httpService: HttpService,
    private inventoryService: InventoryService,
    private readonly configService: ConfigService,
  ) {
    this.productServiceUrl = this.configService.get('PRODUCT_SERVICE_URL');
    this.userServiceUrl = this.configService.get('USER_SERVICE_URL');
  }

  async getOrCreateCart(userId: string) {
    const cart: any = await this.cartRepository.getOrCreateCart(userId);

    // Chuyển đổi `inventory_id` thành số
    cart.items = cart.items.map((item) => {
      item.inventory_id = Number(item.inventory_id);
      return item;
    });

    // Lấy danh sách các `inventory_id`, `product_id` và `shop_id`
    const inventoryIds = cart.items.map((item) => Number(item.inventory_id));
    const productIds = cart.items.map((item) => item.product_id);
    const shopIds: any = [...new Set(cart.items.map((item) => item.shop_id))]; // Loại bỏ các giá trị trùng lặp

    // Fetch inventories, products, and shops in parallel
    const [inventories, products, shops]: [any, any, any] = await Promise.all([
      inventoryIds.length > 0
        ? this.inventoryService.getInventoryByListIds(inventoryIds)
        : [],
      productIds.length > 0 ? this.getProductByListIds(productIds) : [],
      shopIds.length > 0 ? this.getShopByListIds(shopIds) : [],
    ]);

    // Convert inventories, products, and shops to maps for quick lookup
    const inventoryMap = new Map(
      inventories.map((inventory) => [inventory.inventory_id, inventory]),
    );
    const productMap = new Map(
      products.map((product) => [product._id, product]),
    );
    const shopMap = new Map(shops.map((shop) => [shop._id, shop]));

    // Group inventories by shop
    const inventoriesByShop = new Map();
    cart.items.forEach((item) => {
      const shopId = item.shop_id;
      if (!inventoriesByShop.has(shopId)) {
        inventoriesByShop.set(shopId, []);
      }
      inventoriesByShop.get(shopId).push(item);
    });

    // Map items with inventory, product, and shop data
    cart.items = shopIds.map((shopId) => {
      const shop = shopMap.get(shopId);
      return {
        shop,
        inventories: inventoriesByShop.get(shopId).map((item) => ({
          ...item,
          inventory: inventoryMap.get(item.inventory_id),
          product: productMap.get(item.product_id),
        })),
      };
    });

    return cart;
  }

  async getInventoriesFromCartByShopId(userId: string, shopId: string) {
    const inventories =
      await this.cartRepository.getInventoriesFromCartByShopId(userId, shopId);

    // Lấy danh sách các `inventory_id`, `product_id` và `shop_id`
    const inventoryIds = inventories.map((item) => Number(item.inventory_id));
    const productIds = inventories.map((item) => item.product_id);
    const shopIds = [...new Set(inventories.map((item) => item.shop_id))]; // Loại bỏ các giá trị trùng lặp

    // Fetch inventories, products, and shops in parallel
    const [inventoriesData, products, shops]: [any, any, any] =
      await Promise.all([
        inventoryIds.length > 0
          ? this.inventoryService.getInventoryByListIds(inventoryIds)
          : [],
        productIds.length > 0 ? this.getProductByListIds(productIds) : [],
        shopIds.length > 0 ? this.getShopByListIds(shopIds) : [],
      ]);

    // Convert inventories, products, and shops to maps for quick lookup

    const inventoryMap = new Map(
      inventoriesData.map((inventory) => [inventory.inventory_id, inventory]),
    );
    const productMap = new Map(
      products.map((product) => [product._id, product]),
    );

    inventories.forEach((item: any) => {
      item.inventory = inventoryMap.get(item.inventory_id);
      item.product = productMap.get(item.product_id);
    });

    return inventories;
  }

  async addInventoryToCart(userId: string, inventory: CartItemDto) {
    return await this.cartRepository.addInventoryToCart(userId, inventory);
  }

  async removeInventoryFromCart(userId: string, inventoryId: number) {
    return await this.cartRepository.removeInventoryFromCart(
      userId,
      inventoryId,
    );
  }

  async removeCart(userId: string) {
    return await this.cartRepository.removeCart(userId);
  }

  //supporting function
  async getProductByListIds(ids: string[]) {
    try {
      const response = await this.httpService.axiosRef({
        url: this.productServiceUrl + '/public/product/by-list-ids',
        method: 'post',
        data: {
          ids,
          populate: [],
          includes: [
            '_id',
            'shop_id',
            'product_name',
            'product_slug',
            'is_has_many_classifications',
            'classifications',
            'images',
          ],
        },
      });

      return response.data.data;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  async getShopByListIds(ids: string[]) {
    try {
      const response = await this.httpService.axiosRef({
        url: this.userServiceUrl + '/public/shop/by-list-ids',
        method: 'post',
        data: {
          ids,
          populate: [],
          includes: [' _id', 'shop_name'],
        },
      });

      return response.data.data;
    } catch (err) {
      console.log(err);
      return [];
    }
  }
}
