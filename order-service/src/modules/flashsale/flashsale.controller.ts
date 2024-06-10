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
import { CreateFlashSaleDto } from './dtos/flashsale.create.dto';
import { FlashSaleService } from './flashsale.service';
import { ResponseHandler } from '../../utilities/response.handler';

@Controller({
  path: '/public/flashsale',
})
export class FlashSalePublicController {
  constructor(
    private readonly flashSaleService: FlashSaleService,
    private readonly responseHandler: ResponseHandler,
  ) {}

  @Get('/shop/:shop_id')
  async getFlashSaleByShopIdWithPagination(
    @Param('shop_id') shop_id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    try {
      const res =
        await this.flashSaleService.getFlashSaleByShopIdWithPagination(
          shop_id,
          page,
          limit,
        );
      return this.responseHandler.createSuccessResponse(
        res,
        'Flash sale fetched successfully',
        HttpStatus.OK,
      );
    } catch (e) {
      return this.responseHandler.createErrorResponse(
        e.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('/create')
  async createFlashSale(@Body() body: CreateFlashSaleDto) {
    try {
      console.log('body', body);
      const res = await this.flashSaleService.createFlashSale(body);
      return this.responseHandler.createSuccessResponse(
        res,
        'Flash sale created successfully',
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
  async getFlashSaleById(@Param('id') id: string) {
    try {
      const res = await this.flashSaleService.getFlashSaleById(id);
      return this.responseHandler.createSuccessResponse(
        res,
        'Flash sale fetched successfully',
        HttpStatus.OK,
      );
    } catch (e) {
      return this.responseHandler.createErrorResponse(
        e.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('/:id')
  async updateFlashSale(@Param('id') id: string, @Body() body: any) {
    try {
      const res = await this.flashSaleService.updateFlashSale(id, body);
      return this.responseHandler.createSuccessResponse(
        res,
        'Flash sale updated successfully',
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
  async deleteFlashSale(@Param('id') id: string) {
    try {
      const res = await this.flashSaleService.deleteFlashSale(id);
      return this.responseHandler.createSuccessResponse(
        res,
        'Flash sale deleted successfully',
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
