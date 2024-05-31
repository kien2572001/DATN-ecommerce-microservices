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
import { CartService } from '../cart.service';
import { ResponseHandler } from '../../../utilities/response.handler';
import { CartItemDto } from '../dtos/cart-item.dto';
import { CartDto } from '../dtos/cart.dto';

@Controller({
  path: '/public/cart',
})
export class CartPublicController {
  constructor(
    private readonly cartService: CartService,
    private readonly responseHandler: ResponseHandler,
  ) {}

  @Get('get-or-create-cart/:userId')
  async getOrCreateCart(@Param('userId') userId: string) {
    try {
      const cart = await this.cartService.getOrCreateCart(userId);
      return this.responseHandler.createSuccessResponse(
        cart,
        'Cart retrieved successfully',
        HttpStatus.OK,
      );
    } catch (e) {
      return this.responseHandler.createErrorResponse(
        e.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('get-inventories-from-cart-by-shop-id/:userId/shop/:shopId')
  async getInventoriesFromCartByShopId(
    @Param('userId') userId: string,
    @Param('shopId') shopId: string,
  ) {
    try {
      const inventories = await this.cartService.getInventoriesFromCartByShopId(
        userId,
        shopId,
      );
      return this.responseHandler.createSuccessResponse(
        inventories,
        'Inventories retrieved successfully',
        HttpStatus.OK,
      );
    } catch (e) {
      return this.responseHandler.createErrorResponse(
        e.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('add-inventory-to-cart/:userId')
  async addInventoryToCart(
    @Param('userId') userId: string,
    @Body() body: CartItemDto,
  ) {
    try {
      console.log('body', body);
      const inventory: CartItemDto = {
        product_id: body.product_id,
        inventory_id: body.inventory_id,
        shop_id: body.shop_id,
        quantity: body.quantity,
      };
      console.log('userId', userId);
      await this.cartService.addInventoryToCart(userId, inventory);
      return this.responseHandler.createSuccessResponse(
        {},
        'Product added to cart successfully',
        HttpStatus.CREATED,
      );
    } catch (e) {
      return this.responseHandler.createErrorResponse(
        e.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('remove-inventory-from-cart/:userId/inventory/:inventoryId')
  async removeProductFromCart(
    @Param('userId') userId: string,
    @Param('inventoryId') inventoryId: number,
  ) {
    try {
      // Remove product from cart
      const result = await this.cartService.removeInventoryFromCart(
        userId,
        Number(inventoryId),
      );
      return this.responseHandler.createSuccessResponse(
        result,
        'Product removed from cart successfully',
        HttpStatus.OK,
      );
    } catch (e) {
      return this.responseHandler.createErrorResponse(
        e.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('remove-cart/:userId')
  async removeCart(@Param('userId') userId: string) {
    try {
      // Remove cart
      await this.cartService.removeCart(userId);
      return this.responseHandler.createSuccessResponse(
        {},
        'Cart removed successfully',
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
