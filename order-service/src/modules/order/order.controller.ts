import {
  Controller,
  Post,
  Get,
  Param,
  Request,
  Body,
  HttpStatus,
  Delete,
} from '@nestjs/common';

import { CreateOrderDto } from './dtos/order.create.dto';
import { OrderService } from './order.service';
import { ResponseHandler } from '../../utilities/response.handler';

@Controller({
  path: '/public/order',
})
export class OrderPublicController {
  constructor(
    private readonly orderService: OrderService,
    private readonly responseHandler: ResponseHandler,
  ) {}

  @Post('/checkout')
  async createOrder(@Body() body: CreateOrderDto) {
    try {
      const res = await this.orderService.placeOrder(body);
      return this.responseHandler.createSuccessResponse(
        res,
        'Order created successfully',
        HttpStatus.OK,
      );
    } catch (e) {
      return this.responseHandler.createErrorResponse(
        e.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('/:id')
  async getOrder(@Param('id') id: number) {
    try {
      const res = await this.orderService.getOrderById(id);
      return this.responseHandler.createSuccessResponse(
        res,
        'Order retrieved successfully',
        HttpStatus.OK,
      );
    } catch (e) {
      return this.responseHandler.createErrorResponse(
        e.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('/:id')
  async deleteOrder(@Param('id') id: number) {
    try {
      const res = await this.orderService.deleteOrder(id);
      return this.responseHandler.createSuccessResponse(
        res,
        'Order deleted successfully',
        HttpStatus.OK,
      );
    } catch (e) {
      return this.responseHandler.createErrorResponse(
        e.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
