import {Request} from 'express';
import {Controller, Post, Body, Get, Param, Req} from '@nestjs/common';
import {ResponseHandler} from "../../../utilities/response.handler";
import {HttpStatus} from "@nestjs/common";
import {ShopService} from "../shop.service";
import {ShopCreateDto} from "../dtos/shop.create.dto";

@Controller({
  path: '/private/shop',
})
export class ShopPrivateController {
  constructor(
    private readonly shopService: ShopService,
    private readonly responseHandler: ResponseHandler
  ) {
  }

  @Get('/:id')
  async getShopById(@Param('id') id: string) {
    const shop = await this.shopService.getShopById(id);
    if (!shop) {
      throw this.responseHandler.createErrorResponse('Shop not found', HttpStatus.NOT_FOUND);
    }
    return this.responseHandler.createSuccessResponse(shop, 'Shop found successfully', HttpStatus.OK);
  }

  @Post('/create')
  async createShop(@Body() body: ShopCreateDto, @Req() req: Request) {
    try {
      const user_id = req.jwtPayload._id;
      const existingShop = await this.shopService.checkExistingShop(user_id);
      if (existingShop) {
        throw this.responseHandler.createErrorResponse('This user already has a shop', HttpStatus.BAD_REQUEST);
      }
      const shop = await this.shopService.createShop({...body, user_id});
      return this.responseHandler.createSuccessResponse(shop, 'Shop created successfully', HttpStatus.CREATED);
    } catch (e) {
      throw this.responseHandler.createErrorResponse(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}