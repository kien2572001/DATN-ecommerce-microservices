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
import { CreateCategoryDto } from '../dtos/category.create.dto';
import { ResponseHandler } from '../../../utilities/response.handler';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateCategoryCommand } from '../commands/impl/create-category.command';
import { CategoryCommandHandlers } from '../commands/handlers';
import { DeleteCategoryCommand } from '../commands/impl/delete-category.command';
import { CategoryQueryHandlers } from '../queries/handlers';
import { GetAllCategoriesQuery } from '../queries/impl/get-all-categories.query';
import { GetCategoriesRootQuery } from '../queries/impl/get-categories-root.query';
@Controller({
  path: '/public/category',
})
export class CategoryPublicController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly responseHandler: ResponseHandler,
    private readonly queryBus: QueryBus,
  ) {
    this.commandBus.register(CategoryCommandHandlers);
    this.queryBus.register(CategoryQueryHandlers);
  }

  @Get('/root-list')
  async getCategoriesRoot() {
    try {
      const categories = await this.queryBus.execute(
        new GetCategoriesRootQuery(),
      );
      return this.responseHandler.createSuccessResponse(
        categories,
        'Categories fetched successfully',
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
