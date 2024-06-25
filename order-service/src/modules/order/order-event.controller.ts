import {
  Controller,
  Post,
  Get,
  Param,
  Request,
  Body,
  HttpStatus,
  Delete,
  Res,
  Query,
} from '@nestjs/common';

import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderService } from './order.service';

@Controller()
export class OrderEventController {
  constructor(private readonly orderService: OrderService) {}

  @MessagePattern('order.placed')
  async handlePlaced(@Payload() message) {
    console.log('Placed event received');
    await this.orderService.handlePlaced(message.code);
  }

  @MessagePattern('order.payment.failed')
  async handlePaymentFailed(@Payload() message) {
    console.log('Payment failed event received');
    await this.orderService.handlePaymentFailed(message.code);
  }

  @MessagePattern('order.payment.success')
  async handlePaymentSuccess(@Payload() message) {
    console.log('Payment success event received');
    //await this.orderService.handlePaymentSuccess(message.order_id);
  }

  @MessagePattern('order.confirmed')
  async handleConfirmed(@Payload() message) {
    console.log('Confirmed event received');
    //await this.orderService.handleConfirmed(message.order_id);
  }

  @MessagePattern('order.shipping.created')
  async handleShippingCreated(@Payload() message) {
    console.log('Shipping created event received');
    //await this.orderService.handleShippingCreated(message.order_id);
  }

  @MessagePattern('order.delivered')
  async handleDelivered(@Payload() message) {
    console.log('Delivered event received');
    //await this.orderService.handleDelivered(message.order_id);
  }
}
