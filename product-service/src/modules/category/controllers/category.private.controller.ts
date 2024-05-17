import {Controller, Post, Get, Param, Request, Body, HttpStatus, Delete} from "@nestjs/common";
import {CreateCategoryDto} from "../dtos/category.create.dto";
import {ResponseHandler} from "../../../utilities/response.handler";
import {CommandBus, QueryBus} from '@nestjs/cqrs';
import {CreateCategoryCommand} from "../commands/impl/create-category.command";
import {CategoryCommandHandlers} from "../commands/handlers";
import {DeleteCategoryCommand} from "../commands/impl/delete-category.command";

@Controller({
  path: '/private/category',
})
export class CategoryPrivateController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly responseHandler: ResponseHandler,
    private readonly queryBus: QueryBus,
  ) {
    this.commandBus.register(CategoryCommandHandlers);
  }

  @Post('/create')
  async createCategory(@Request() req: any, @Body() body: CreateCategoryDto) {
    try {
      let shop_id: string;
      if (req.jwtPayload && req.jwtPayload.shop_id) {
        shop_id = req.jwtPayload.shop_id;
      }
      const newCategory = await this.commandBus.execute(new CreateCategoryCommand(body, shop_id));
      return this.responseHandler.createSuccessResponse(newCategory, 'Category created successfully', HttpStatus.CREATED)
    } catch (e) {
      return this.responseHandler.createErrorResponse(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':category_id')
  async deleteCategory(@Param('category_id') category_id: string) {
    try {
      const result = await this.commandBus.execute(new DeleteCategoryCommand(category_id));
      return this.responseHandler.createSuccessResponse(result, 'Category deleted successfully', HttpStatus.OK);
    } catch (e) {
      return this.responseHandler.createErrorResponse(e.message, HttpStatus.BAD_REQUEST);
    }
  }


  @Get('list')
  async listCategory() {
    return 'List category';
  }
}