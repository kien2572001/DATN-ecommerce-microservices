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
  UseInterceptors, UploadedFiles
} from "@nestjs/common";

import {ResponseHandler} from "../../../utilities/response.handler";
import {FileService} from "../../../utilities/file.service";

@Controller({
  path: '/public/product',
})
export class ProductPublicController {
  constructor(
    private readonly responseHandler: ResponseHandler,
    private readonly fileService: FileService
  ) {
  }

  @Get(':product_id')
  async getProductById(@Param('product_id') product_id: string) {
    try {
      return this.responseHandler.createSuccessResponse({}, 'Product retrieved successfully', HttpStatus.OK);
    } catch (e) {
      return this.responseHandler.createErrorResponse(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':product_slug')
  async getProductBySlug(@Param('product_slug') product_slug: string) {
    try {
      return this.responseHandler.createSuccessResponse({}, 'Product retrieved successfully', HttpStatus.OK);
    } catch (e) {
      return this.responseHandler.createErrorResponse(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}