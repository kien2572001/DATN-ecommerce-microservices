import {Controller, Post, Get, Param, Request, Body} from "@nestjs/common";
import {CreateCategoryDto} from "./category/dtos/category.create.dto";
import {ResponseHandler} from "../utilities/response.handler";
import {CommandBus} from '@nestjs/cqrs';
import {CreateCategoryCommand} from "./category/commands/impl/create-category.command";

@Controller({
  path: '/category',
})
export class CategoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly responseHandler: ResponseHandler
  ) {
  }

  @Post('/private/create')
  async createCategory(@Request() req: any, @Body() body: CreateCategoryDto) {
    try {
      const shop_id = req.jwtPayload.shop_id;
      await this.commandBus.execute(new CreateCategoryCommand(body, shop_id));
      return this.responseHandler.createSuccessResponse('Category created successfully');
    } catch (e) {
      return this.responseHandler.createErrorResponse(e.message);
    }
  }

  @Get('list')
  async listCategory() {
    return 'List category';
  }
}