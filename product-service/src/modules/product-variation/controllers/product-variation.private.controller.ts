import {
  Controller,
  Post,
  Get,
  Param,
  Request,
  Body,
  HttpStatus,
  Delete,
} from "@nestjs/common";

import {ResponseHandler} from "../../../utilities/response.handler";
import {CommandBus, QueryBus} from '@nestjs/cqrs';
import {ProductVariationCommandHandlers} from "../commands/handlers";
import {UpdateProductVariationCommand} from "../commands/impl/update-product-variation.command";

@Controller({
  path: '/private/product-variation',
})
export class ProductVariationPrivateController {
  constructor(
    private readonly responseHandler: ResponseHandler,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {
    this.commandBus.register(ProductVariationCommandHandlers);
  }

  @Post('/update')
  async updateProductVariation(
    @Request() req: any,
    @Body() updateProductVariationDto: any,
  ) {
    try {
      if (req.jwtPayload.shop_id) {
        const shop_id = req.jwtPayload.shop_id;
        const updatedProductVariation = await this.commandBus.execute(new UpdateProductVariationCommand(updateProductVariationDto, shop_id));
        return this.responseHandler.createSuccessResponse(updatedProductVariation, 'Product variation updated successfully', HttpStatus.OK)
      } else throw this.responseHandler.createErrorResponse('You are not authorized to perform this action', HttpStatus.UNAUTHORIZED);
    } catch (e) {
      return this.responseHandler.createErrorResponse(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':product_variation_id')
  async deleteProductVariation(@Param('product_variation_id') product_variation_id: number) {
    try {
      return this.responseHandler.createSuccessResponse({}, 'Product variation deleted successfully', HttpStatus.OK);
    } catch (e) {
      return this.responseHandler.createErrorResponse(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}