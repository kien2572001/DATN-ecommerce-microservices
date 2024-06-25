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

import { CreateOrderDto } from './dtos/order.create.dto';
import { OrderService } from './order.service';
import { ResponseHandler } from '../../utilities/response.handler';
import { MessagePattern, Payload } from '@nestjs/microservices';

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
      //console.log('Creating order');
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

  @Post('/payment/momo-ipn')
  async momoWebhook(@Body() body: any, @Res() res) {
    try {
      console.log('Momo webhook received', body.message);
      await this.orderService.handleMomoIPN(body);
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (e) {
      console.log(e);
    }
  }

  @Post('/payment/stripe/webhook')
  async stripeWebhook(@Body() body: any, @Res() res) {
    try {
      await this.orderService.handleStripeWebhook(body);
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (e) {
      console.log(e);
    }
  }

  @Post('/payment/stripe/create-payment-intent')
  async createPaymentIntent(@Body() body: any) {
    // try {
    //   //const res = await this.orderService.createPaymentIntent(body);
    //   return this.responseHandler.createSuccessResponse(
    //     res,
    //     'Payment successful',
    //     HttpStatus.OK,
    //   );
    // } catch (e) {
    //   return this.responseHandler.createErrorResponse(
    //     e.message,
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
  }

  // @Post('/payment')
  // async payment(@Body() body: any) {
  //   try {
  //     const res = await this.orderService.createPaymentIntent(body);
  //     return this.responseHandler.createSuccessResponse(
  //       res,
  //       'Payment successful',
  //       HttpStatus.OK,
  //     );
  //   } catch (e) {
  //     return this.responseHandler.createErrorResponse(
  //       e.message,
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  // }

  @Post('/:code/confirm')
  async confirmOrder(@Param('code') code: string) {
    try {
      const res = await this.orderService.changeOrderStatus(code, 'confirmed');
      return this.responseHandler.createSuccessResponse(
        res,
        'Order confirmed',
        HttpStatus.OK,
      );
    } catch (e) {
      return this.responseHandler.createErrorResponse(
        e.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('/:code')
  async getOrder(@Param('code') code: string) {
    try {
      const res = await this.orderService.findOrderByCode(code);
      return this.responseHandler.createSuccessResponse(
        res,
        'Order found',
        HttpStatus.OK,
      );
    } catch (e) {
      return this.responseHandler.createErrorResponse(
        e.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('/user/:user_id')
  async getOrdersByUserId(
    @Param('user_id') user_id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    try {
      const res = await this.orderService.findOrdersByUserId(
        user_id,
        page,
        limit,
      );
      return this.responseHandler.createSuccessResponse(
        res,
        'Orders found',
        HttpStatus.OK,
      );
    } catch (e) {
      return this.responseHandler.createErrorResponse(
        e.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('/shop/:shop_id')
  async getOrdersByShopId(
    @Param('shop_id') shop_id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status: string = 'all',
    @Query('code') code: string = '',
  ) {
    try {
      const res = await this.orderService.findOrdersByShopId(
        shop_id,
        page,
        limit,
        status,
        code,
      );
      return this.responseHandler.createSuccessResponse(
        res,
        'Orders found',
        HttpStatus.OK,
      );
    } catch (e) {
      return this.responseHandler.createErrorResponse(
        e.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // @MessagePattern('order.created')
  // async orderCreated(@Payload() message) {
  //   console.log('Order created event received');
  //   console.log(message);
  //   return 'Order created event received';
  // }
}
