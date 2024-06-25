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
import { CreateInventoryDto } from '../dtos/inventory.create.dto';
import { InventoryService } from '../inventory.service';
import { ResponseHandler } from '../../../utilities/response.handler';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GrpcMethod } from '@nestjs/microservices';

@Controller({
  path: '/public/inventory',
})
export class InventoryPublicController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly responseHandler: ResponseHandler,
  ) {}

  @GrpcMethod('InventoryService', 'PurchaseInventories')
  async purchaseInventoriesGrpc(data: any): Promise<any> {
    try {
      //console.log('data.inventories', data.inventories);
      const inventories = data.inventories.map((inventory) => {
        return {
          inventory_id: inventory.inventory_id || inventory.inventoryId,
          quantity: inventory.quantity,
          price: inventory.price,
        };
      });
      const res = await this.inventoryService.purchaseInventories(inventories);
      return {
        success: res,
      };
    } catch (e) {
      return {
        success: false,
      };
    }
  }

  @MessagePattern('flashsale.update-inventory')
  async updateInventory(@Payload() message) {
    const res =
      await this.inventoryService.updateFlashSalePriceAndQuantityAndTime(
        message.inventory_id,
        message.discount_price,
        message.discount_quantity,
        message.time_start,
        message.time_end,
      );
    console.log('Inventory updated event received');
  }

  @MessagePattern('inventory.flash_sale.end')
  async endFlashSale(@Payload() message) {
    console.log('message', message);
    console.log('Return remain quantity to inventory');
    await this.inventoryService.returnInventories([
      {
        inventory_id: message.inventory_id,
        quantity: Number.parseInt(message.flash_sale_quantity),
      },
    ]);
  }

  @Post('/init-flash-sale')
  async initFlashSale(@Body() body: any) {
    try {
      const inventories = body.inventories;
      const startTime = body.startTime;
      const endTime = body.endTime;
      const res = await this.inventoryService.initFlashSaleInventory(
        inventories,
        startTime,
        endTime,
      );
      return this.responseHandler.createSuccessResponse(
        res,
        'Flash sale initialized successfully',
        HttpStatus.OK,
      );
    } catch (e) {
      return this.responseHandler.createErrorResponse(
        e.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('/purchase')
  async purchaseInventories(@Body() body: any) {
    try {
      const res = await this.inventoryService.purchaseInventories(body);
      return this.responseHandler.createSuccessResponse(
        res,
        'Inventory purchased successfully',
        HttpStatus.OK,
      );
    } catch (e) {
      //console.log(e);
      return this.responseHandler.createErrorResponse(
        e.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('/return')
  async returnInventories(@Body() body: any) {
    try {
      const res = await this.inventoryService.returnInventories(body);
      return this.responseHandler.createSuccessResponse(
        res,
        'Inventory returned successfully',
        HttpStatus.OK,
      );
    } catch (e) {
      return this.responseHandler.createErrorResponse(
        e.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('create')
  async createInventory(@Body() body: CreateInventoryDto) {
    try {
      const newInventory = await this.inventoryService.createInventory(body);
      return this.responseHandler.createSuccessResponse(
        newInventory,
        'Inventory created successfully',
        HttpStatus.CREATED,
      );
    } catch (e) {
      return this.responseHandler.createErrorResponse(
        e.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('product/by-list-ids')
  async getInventoriesByProductIds(@Body() body: any) {
    try {
      const inventories =
        await this.inventoryService.getInventoriesByProductIds(body.ids);
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

  @Get('product/:productId')
  async getInventoryByProductId(@Param('productId') productId: string) {
    try {
      const inventories =
        await this.inventoryService.getInventoriesByProductId(productId);
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

  @Post('product/:productId')
  async updateInventoryByProductId(
    @Param('productId') productId: string,
    @Body() body: any,
  ) {
    try {
      const updatedInventory =
        await this.inventoryService.updateInventoryByProductId(
          productId,
          body.inventories,
          body.old_classifications,
          body.new_classifications,
        );
      return this.responseHandler.createSuccessResponse(
        updatedInventory,
        'Inventory updated successfully',
        HttpStatus.OK,
      );
    } catch (e) {
      return this.responseHandler.createErrorResponse(
        e.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('create-many')
  async createManyInventories(
    @Request() req: any,
    @Body() body: Array<CreateInventoryDto>,
  ) {
    try {
      const newInventory =
        await this.inventoryService.createManyInventories(body);
      return this.responseHandler.createSuccessResponse(
        newInventory,
        'Inventory created successfully',
        HttpStatus.CREATED,
      );
    } catch (e) {
      return this.responseHandler.createErrorResponse(
        e.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
