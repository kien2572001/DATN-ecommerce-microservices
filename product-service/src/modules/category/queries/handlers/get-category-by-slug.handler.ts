import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CategoryRepository } from '../../repository/category.repository';
import { GetCategoryBySlugQuery } from '../impl/get-category-by-slug.query';

@QueryHandler(GetCategoryBySlugQuery)
export class GetCategoryBySlugHandler
  implements IQueryHandler<GetCategoryBySlugQuery>
{
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(query: GetCategoryBySlugQuery) {
    // Find the parent category by slug
    const category = await this.categoryRepository.findOneByCondition({
      category_slug: query.slug,
    });

    // If the category is not found, throw an error
    if (!category) {
      throw new Error('Category not found');
    }

    // Get the level of the parent category
    const level = category.level;

    // Find all child categories that have a path starting with the parent's path and are one level deeper
    const childCategories = await this.categoryRepository.findAll({
      path: { $regex: `^${category.path}/*`, $options: 'i' },
      level: level + 1,
    });

    // Return the parent category and its direct children
    return {
      category,
      child: childCategories.items,
    };
  }
}
