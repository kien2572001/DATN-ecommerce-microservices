import { Request } from 'express';
import { Controller, Post, Body, Get, Param, Req } from '@nestjs/common';
import { ResponseHandler } from '../../../utilities/response.handler';
import { HttpStatus } from '@nestjs/common';
import { ShopService } from '../shop.service';
import { ShopCreateDto } from '../dtos/shop.create.dto';

@Controller({
  path: '/public/shop',
})
export class ShopPublicController {
  constructor(
    private readonly shopService: ShopService,
    private readonly responseHandler: ResponseHandler,
  ) {}

  @Post('/by-list-ids')
  async getShopByListIds(@Body() body: any) {
    const shop = await this.shopService.getShopByListIds(
      body.ids,
      [],
      body.includes,
    );
    return this.responseHandler.createSuccessResponse(
      shop,
      'Shop retrieved successfully',
      HttpStatus.OK,
    );
  }

  @Get('/id/:shop_id')
  async getShopById(@Param('shop_id') shop_id: string) {
    const shop = await this.shopService.getShopById(shop_id);
    return this.responseHandler.createSuccessResponse(
      shop,
      'Shop retrieved successfully',
      HttpStatus.OK,
    );
  }

  @Get('/list-shop-ids')
  async getListShopIds(@Req() req: Request) {
    const shopIds = await this.shopService.getListShopIds();
    return this.responseHandler.createSuccessResponse(
      shopIds,
      'List shop ids',
      HttpStatus.OK,
    );
  }
}
