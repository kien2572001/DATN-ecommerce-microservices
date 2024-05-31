import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CategoryRepository } from '../../repository/category.repository';
import { GetCategoriesRootQuery } from '../impl/get-categories-root.query';

@QueryHandler(GetCategoriesRootQuery)
export class GetCategoriesRootHandler
  implements IQueryHandler<GetCategoriesRootQuery>
{
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(query: GetCategoriesRootQuery) {
    return await this.categoryRepository.findAll({
      level: 0,
    });
  }
}
