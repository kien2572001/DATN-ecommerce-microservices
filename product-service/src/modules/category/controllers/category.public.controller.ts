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
import { GetCategoryBySlugQuery } from '../queries/impl/get-category-by-slug.query';
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

  @Get('/slug/:slug')
  async getCategoryBySlug(@Param('slug') slug: string) {
    try {
      const category = await this.queryBus.execute(
        new GetCategoryBySlugQuery(slug),
      );
      return this.responseHandler.createSuccessResponse(
        category,
        'Category fetched successfully',
        HttpStatus.OK,
      );
    } catch (e) {
      return this.responseHandler.createErrorResponse(
        e.message,
        HttpStatus.BAD_REQUEST,
      );
    }
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
