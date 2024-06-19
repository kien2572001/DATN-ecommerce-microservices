import {
  Controller,
  Post,
  Get,
  Param,
  Request,
  Body,
  HttpStatus,
  Delete,
  Query,
} from '@nestjs/common';
import { FlashSaleProductService } from './flashsale-product.service';
import { ResponseHandler } from '../../utilities/response.handler';
@Controller({
  path: '/public/flashsale-product',
})
export class FlashSaleProductPublicController {
  constructor(
    private readonly flashSaleProductService: FlashSaleProductService,
    private readonly responseHandler: ResponseHandler,
  ) {}

  @Get('/flash-sale/:flash_sale_id')
  async getFlashSaleProductByFlashSaleId(
    @Param('flash_sale_id') flash_sale_id: string,
  ) {
    try {
      const res =
        await this.flashSaleProductService.getFlashSaleProductByFlashSaleId(
          flash_sale_id,
        );
      return this.responseHandler.createSuccessResponse(
        res,
        'Flash sale product fetched successfully',
        HttpStatus.OK,
      );
    } catch (e) {
      return this.responseHandler.createErrorResponse(
        e.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  @Get('/product/:product_id/latest')
  async getLatestFlashSaleProductByProductId(
    @Param('product_id') product_id: string,
  ) {
    try {
      const res =
        await this.flashSaleProductService.getLatestFlashSaleProductByProductId(
          product_id,
        );
      return this.responseHandler.createSuccessResponse(
        res,
        'Flash sale product fetched successfully',
        HttpStatus.OK,
      );
    } catch (e) {
      return this.responseHandler.createErrorResponse(
        e.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('/product/:product_id')
  async getFlashSaleProductByProductId(
    @Param('product_id') product_id: string,
  ) {
    try {
      const res =
        await this.flashSaleProductService.getFlashSaleProductByProductId(
          product_id,
        );
      return this.responseHandler.createSuccessResponse(
        res,
        'Flash sale product fetched successfully',
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
