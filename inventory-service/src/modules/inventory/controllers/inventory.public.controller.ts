import {Controller, Post, Get, Param, Request, Body, HttpStatus, Delete} from "@nestjs/common";
import {CreateInventoryDto} from "../dtos/inventory.create.dto";
import {InventoryService} from "../inventory.service";
import {ResponseHandler} from "../../../utilities/response.handler";

@Controller({
  path: '/public/inventory',
})
export class InventoryPublicController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly responseHandler: ResponseHandler
  ) {
  }

  @Get('list')
  async listInventory() {
    try {
      const inventories = await this.inventoryService.getInventory();
      return this.responseHandler.createSuccessResponse(inventories, 'Inventories retrieved successfully', HttpStatus.OK);
    } catch (e) {
      return this.responseHandler.createErrorResponse(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('product/:productId')
  async getInventoryByProductId(@Param('productId') productId: string) {
    try {
      const inventories = await this.inventoryService.getInventoriesByProductId(productId);
      return this.responseHandler.createSuccessResponse(inventories, 'Inventories retrieved successfully', HttpStatus.OK);
    } catch (e) {
      return this.responseHandler.createErrorResponse(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('create-many')
  async createInventory(@Request() req: any, @Body() body: Array<CreateInventoryDto>) {
    try {
      const newInventory = await this.inventoryService.createManyInventories(body);
      return this.responseHandler.createSuccessResponse(newInventory, 'Inventory created successfully', HttpStatus.CREATED)
    } catch (e) {
      return this.responseHandler.createErrorResponse(e.message, HttpStatus.BAD_REQUEST);
    }
  }

}