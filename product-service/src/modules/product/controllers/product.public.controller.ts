import {
  Controller,
  Post,
  Get,
  Param,
  Request,
  Body,
  HttpStatus,
  Delete,
  UploadedFile,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';

import { ResponseHandler } from '../../../utilities/response.handler';
import { FileService } from '../../../utilities/file.service';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ProductCommandHandlers } from '../commands/handlers';
import { ProductQueryHandlers } from '../queries/handlers';
import { GetProductBySlugQuery } from '../queries/impl/get-product-by-slug.query';
import { GetProductByListIdsQuery } from '../queries/impl/get-product-by-list-ids.query';
import { GetProductsHomepageQuery } from '../queries/impl/get-products-in-homepage.query';
@Controller({
  path: '/public/product',
})
export class ProductPublicController {
  constructor(
    private readonly responseHandler: ResponseHandler,
    private readonly fileService: FileService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {
    this.commandBus.register(ProductCommandHandlers);
    this.queryBus.register(ProductQueryHandlers);
  }

  @Get('/homepage')
  async getProductsHomePage(
    @Request() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('keyword') keyword: string,
    @Query('category_slug') category_slug: string,
    @Query('trending') trending: string,
    @Query('popular') popular: string,
    @Query('newArrival') newArrival: string,
  ) {
    try {
      const products = await this.queryBus.execute(
        new GetProductsHomepageQuery(
          page,
          limit,
          keyword,
          category_slug,
          trending,
          popular,
          newArrival,
        ),
      );
      return this.responseHandler.createSuccessResponse(
        products,
        'Products retrieved successfully',
        HttpStatus.OK,
      );
    } catch (e) {
      return this.responseHandler.createErrorResponse(
        e.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('/by-list-ids')
  async getProductsByListIds(@Request() req, @Body() body: any) {
    try {
      const products = await this.queryBus.execute(
        new GetProductByListIdsQuery(body.ids, body.populate, body.includes),
      );
      return this.responseHandler.createSuccessResponse(
        products,
        'Products retrieved successfully',
        HttpStatus.OK,
      );
    } catch (e) {
      return this.responseHandler.createErrorResponse(
        e.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('/id/:product_id')
  async getProductById(@Param('product_id') product_id: string) {
    try {
      return this.responseHandler.createSuccessResponse(
        {},
        'Product retrieved successfully',
        HttpStatus.OK,
      );
    } catch (e) {
      return this.responseHandler.createErrorResponse(
        e.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('/slug/:product_slug')
  async getProductBySlug(@Param('product_slug') product_slug: string) {
    try {
      const products = await this.queryBus.execute(
        new GetProductBySlugQuery(product_slug),
      );
      return this.responseHandler.createSuccessResponse(
        products,
        'Product retrieved successfully',
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
