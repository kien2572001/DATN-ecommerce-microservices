import {Controller, Post, Get, Param, Request, Body, HttpStatus, Delete} from "@nestjs/common";
import {CartService} from "../cart.service";
import {ResponseHandler} from "../../../utilities/response.handler";
import {CartItemDto} from "../dtos/cart-item.dto";
import {CartDto} from "../dtos/cart.dto";

@Controller({
  path: '/public/cart',
})
export class CartPublicController {
  constructor(
    private readonly cartService: CartService,
    private readonly responseHandler: ResponseHandler
  ) {
  }

  @Get('get-or-create-cart/:userId')
  async getOrCreateCart(@Param('userId') userId: string) {
    try {
      const cart = await this.cartService.getOrCreateCart(userId);
      return this.responseHandler.createSuccessResponse(cart, 'Cart retrieved successfully', HttpStatus.OK);
    } catch (e) {
      return this.responseHandler.createErrorResponse(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('add-product-to-cart/:userId')
  async addProductToCart(@Param('userId') userId: string, @Body() body: CartItemDto) {
    try {
      console.log('body', body);
      const product: CartItemDto = {
        product_id: body.product_id,
        shop_id: body.shop_id,
        quantity: body.quantity
      }
      await this.cartService.addProductToCart(userId, product);
      return this.responseHandler.createSuccessResponse({}, 'Product added to cart successfully', HttpStatus.CREATED);
    } catch (e) {
      return this.responseHandler.createErrorResponse(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('remove-product-from-cart/:userId/:productId')
  async removeProductFromCart(@Param('userId') userId: string, @Param('productId') productId: string) {
    try {
      // Remove product from cart
      return this.responseHandler.createSuccessResponse({}, 'Product removed from cart successfully', HttpStatus.OK);
    } catch (e) {
      return this.responseHandler.createErrorResponse(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('remove-cart/:userId')
  async removeCart(@Param('userId') userId: string) {
    try {
      // Remove cart
      await this.cartService.removeCart(userId);
      return this.responseHandler.createSuccessResponse({}, 'Cart removed successfully', HttpStatus.OK);
    } catch (e) {
      return this.responseHandler.createErrorResponse(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}