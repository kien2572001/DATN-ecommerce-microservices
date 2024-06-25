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
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FlashSaleProductService } from './flashsale-product.service';
@Controller({
  path: '/public/flashsale',
})
export class FlashSalePublicController {
  constructor(
    private readonly flashSaleService: FlashSaleService,
    private readonly responseHandler: ResponseHandler,
    private readonly flashSaleProductService: FlashSaleProductService,
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

  @Get('/start')
  async getActiveFlashSale(
    @Query('time_start') time_start: string,
    @Query('time_end') time_end: string,
  ) {
    try {
      const timeStart = new Date(time_start);
      const timeEnd = new Date(time_end);
      const res = await this.flashSaleService.startFlashSale(
        timeStart,
        timeEnd,
      );
      return this.responseHandler.createSuccessResponse(
        res,
        'Flash sale started successfully',
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
      console.log(e);
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

  @MessagePattern('flash-sale.created')
  async handleFlashSaleCreated(@Payload() data: any) {
    try {
      //console.log('Flash sale created', data);
      await this.flashSaleProductService.handleFlashSaleCreateEvent(data._id);
    } catch (e) {
      console.log(e);
    }
  }

  @MessagePattern('flash-sale.updated')
  async handleFlashSaleUpdated(@Payload() data: any) {
    try {
      //console.log('Flash sale updated', data);
      await this.flashSaleProductService.handleFlashSaleUpdateEvent(data._id);
    } catch (e) {
      console.log(e);
    }
  }

  @MessagePattern('flash-sale.deleted')
  async handleFlashSaleDeleted(@Payload() data: any) {
    try {
      //console.log('Flash sale deleted', data);
      await this.flashSaleProductService.handleFlashSaleDeleteEvent(data._id);
    } catch (e) {
      console.log(e);
    }
  }
}
