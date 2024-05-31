import { Injectable } from '@nestjs/common';
import { OrderRepository } from './repository/order.repository';
import { OrderItemRepository } from './repository/order-item.repository';
import { CreateOrderDto } from './dtos/order.create.dto';
import { OrderEntity } from './repository/order.entity';
import { OrderItemEntity } from './repository/order-item.entity';
import { HttpService } from '@nestjs/axios';
@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderItemRepository: OrderItemRepository,
  ) {}

  private async checkInventoryAvailabilityAndDeduct(orderItems) {
    // Logic to check inventory availability and deduct
  }

  private async removeInventoriesFromCartAfterOrderCreation(
    userId,
    inventoryIds,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto) {
    const order = new OrderEntity();
    order.user_id = createOrderDto.user_id;
    order.shop_id = createOrderDto.shop_id;
    order.shipping_address = createOrderDto.shipping_address;
    order.status = 'placed';
    order.total = createOrderDto.order_items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    order.order_items = createOrderDto.order_items.map((item) => {
      const orderItem = new OrderItemEntity();
      orderItem.inventory_id = item.inventory_id;
      orderItem.product_id = item.product_id;
      orderItem.quantity = item.quantity;
      orderItem.price = item.price;
      return orderItem;
    });
    return await this.orderRepository.save(order);
  }

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
