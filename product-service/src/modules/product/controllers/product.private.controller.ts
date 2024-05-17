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
import {AnyFilesInterceptor, FileInterceptor} from "@nestjs/platform-express";
import {CreateProductDto} from "../dtos/product.create.dto";
import {CommandBus, QueryBus} from '@nestjs/cqrs';
import {ProductCommandHandlers} from "../commands/handlers";
import {ProductQueryHandlers} from "../queries/handlers";
import {CreateProductCommand} from "../commands/impl/create-product.command";
import {GetProductBySlugQuery} from "../queries/impl/get-product-by-slug.query";

@Controller({
  path: '/private/product',
})
export class ProductPrivateController {
  constructor(
    private readonly responseHandler: ResponseHandler,
    private readonly fileService: FileService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {
    this.commandBus.register(ProductCommandHandlers);
    this.queryBus.register(ProductQueryHandlers);
  }

  @Get(':product_slug')
  async getProductBySlug(@Param('product_slug') product_slug: string) {
    try {
      const product = await this.queryBus.execute(new GetProductBySlugQuery(product_slug));
      return this.responseHandler.createSuccessResponse(product, 'Product retrieved successfully', HttpStatus.OK);
    } catch (e) {
      return this.responseHandler.createErrorResponse(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/create')
  @UseInterceptors(AnyFilesInterceptor())
  async createProduct(
    @Request() req: any,
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    try {
      if (req.jwtPayload.shop_id) {
        const shop_id = req.jwtPayload.shop_id;
        createProductDto.files = files;
        const newProduct = await this.commandBus.execute(new CreateProductCommand(createProductDto, shop_id));
        return this.responseHandler.createSuccessResponse(newProduct, 'Product created successfully', HttpStatus.CREATED)
      } else throw this.responseHandler.createErrorResponse('You are not authorized to perform this action', HttpStatus.UNAUTHORIZED);
    } catch (e) {
      return this.responseHandler.createErrorResponse(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':product_id')
  async deleteProduct(@Param('product_id') product_id: number) {
    try {
      return this.responseHandler.createSuccessResponse({}, 'Product deleted successfully', HttpStatus.OK);
    } catch (e) {
      return this.responseHandler.createErrorResponse(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProductImage(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    try {
      const response = await this.fileService.uploadFile(file);
      return this.responseHandler.createSuccessResponse(response, 'Product image uploaded successfully', HttpStatus.OK)
    } catch (e) {
      return this.responseHandler.createErrorResponse(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}