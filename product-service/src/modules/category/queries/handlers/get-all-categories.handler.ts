import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CategoryRepository } from '../../repository/category.repository';
import { GetAllCategoriesQuery } from '../impl/get-all-categories.query';

@QueryHandler(GetAllCategoriesQuery)
export class GetAllCategoriesHandler
  implements IQueryHandler<GetAllCategoriesQuery>
{
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(query: GetAllCategoriesQuery) {
    return await this.categoryRepository.findAll({});
  }
}
