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

@Controller({
  path: '/public/inventory',
})
export class InventoryPublicController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly responseHandler: ResponseHandler,
  ) {}

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
