import { Injectable } from '@nestjs/common';
import { OrderRepository } from './repository/order.repository';
import { OrderItemRepository } from './repository/order-item.repository';
import { CreateOrderDto } from './dtos/order.create.dto';
import { OrderEntity } from './repository/order.entity';
import { OrderItemEntity } from './repository/order-item.entity';
import { HttpService } from '@nestjs/axios';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { v4 as uuidv4 } from 'uuid';
import { OrderStatusEnum } from 'src/enums/orderStatus.enum';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class OrderService {
  private readonly redisClient: Redis;
  private readonly inventoryServiceUrl: string;

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderItemRepository: OrderItemRepository,
    private httpService: HttpService,
    @InjectRedis() private readonly client: Redis,
    private readonly configService: ConfigService,
  ) {
    this.redisClient = client;
    this.inventoryServiceUrl = this.configService.get('inventory_service_url');
  }

  private async checkInventoryAvailabilityAndDeduct(orderItems) {
    try {
      const response = await this.httpService.axiosRef({
        method: 'post',
        url: this.inventoryServiceUrl + 'public/inventory/purchase',
        data: orderItems,
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

  private async returnInventoriesInCaseOfOrderFailure(orderItems) {
    try {
      const response = await this.httpService.axiosRef({
        method: 'post',
        url: this.inventoryServiceUrl + '/public/inventory/return',
        data: orderItems,
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

  private async removeInventoriesFromCartAfterOrderCreation(
    userId,
    inventoryIds,
  ) {}

  async placeOrder(createOrderDto: CreateOrderDto) {
    // Step 1: Kiểm tra và trừ số lượng tồn kho
    const isInventoryAvailable = await this.checkInventoryAvailabilityAndDeduct(
      createOrderDto.order_items.map((item) => ({
        inventory_id: item.inventory_id,
        quantity: item.quantity,
      })),
    );

    if (!isInventoryAvailable) {
      return {
        status: 'failed',
        message: 'Inventory is out of stock',
      };
    }

    try {
      // Step 2: Tạo đơn hàng
      const order = await this.createOrder(createOrderDto);

      // Step 3: Xóa sản phẩm khỏi giỏ hàng
      await this.removeInventoriesFromCartAfterOrderCreation(
        createOrderDto.user_id,
        createOrderDto.order_items.map((item) => item.inventory_id),
      );

      return {
        status: 'success',
        message: 'Order placed successfully',
        order,
      };
    } catch (error) {
      // Nếu có lỗi xảy ra, quay lui các bước đã thành công

      // Rollback Step 1: Hoàn trả lại số lượng tồn kho đã trừ
      await this.returnInventoriesInCaseOfOrderFailure(
        createOrderDto.order_items.map((item) => ({
          inventory_id: item.inventory_id,
          quantity: item.quantity,
        })),
      );

      // Log lỗi và trả về thông báo lỗi
      console.error('Error placing order:', error);
      return {
        status: 'failed',
        message: 'An error occurred while placing the order',
      };
    }
  }

  async createOrder(createOrderDto: CreateOrderDto) {
    const order: any = {};
    order.code = uuidv4();
    order.user_id = createOrderDto.user_id;
    order.shop_id = createOrderDto.shop_id;
    order.shipping_address = createOrderDto.shipping_address;
    order.shipping_fee = createOrderDto.shipping_fee;
    order.payment_method = createOrderDto.payment_method;
    order.status = OrderStatusEnum.PLACED;
    order.total = createOrderDto.order_items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    order.order_items = createOrderDto.order_items.map((item) => {
      const orderItem: any = {};
      orderItem.inventory_id = item.inventory_id;
      orderItem.product_id = item.product_id;
      orderItem.quantity = item.quantity;
      orderItem.price = item.price;
      return orderItem;
    });
    const queueName = `order_queue_0`;

    await this.redisClient.rpush(queueName, JSON.stringify(order));

    return order.code;

    //return await this.orderRepository.save(order);
  }

  // async createOrder(createOrderDto: CreateOrderDto) {
  //   const order = new OrderEntity();
  //   order.user_id = createOrderDto.user_id;
  //   order.shop_id = createOrderDto.shop_id;
  //   order.shipping_address = createOrderDto.shipping_address;
  //   order.shipping_fee = createOrderDto.shipping_fee;
  //   order.payment_method = createOrderDto.payment_method;
  //   order.status = 'placed';
  //   order.total = createOrderDto.order_items.reduce(
  //     (acc, item) => acc + item.price * item.quantity,
  //     0,
  //   );
  //   order.order_items = createOrderDto.order_items.map((item) => {
  //     const orderItem = new OrderItemEntity();
  //     orderItem.inventory_id = item.inventory_id;
  //     orderItem.product_id = item.product_id;
  //     orderItem.quantity = item.quantity;
  //     orderItem.price = item.price;
  //     return orderItem;
  //   });
  //   return await this.orderRepository.save(order);
  // }

  async getOrderById(orderId: number) {
    const orderEntity = await this.orderRepository.findOne({
      where: { order_id: orderId },
      relations: ['orderItems'],
    });
    return orderEntity;
  }

  async updateOrder(orderId: number, order: Record<string, any>) {
    const orderEntity = await this.orderRepository.update(orderId, order);
    return orderEntity;
  }

  async deleteOrder(orderId: number) {
    const orderEntity = await this.orderRepository.delete(orderId);
    return orderEntity;
  }

  async createOrderItem(orderId: number, orderItem: Record<string, any>) {
    const orderItemEntity = await this.orderItemRepository.create(orderItem);
    return orderItemEntity;
  }

  async getOrderItemById(orderItemId) {
    const orderItemEntity = await this.orderItemRepository.findOne(orderItemId);
    return orderItemEntity;
  }
}
