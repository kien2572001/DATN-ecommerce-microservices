import { GetAllCategoriesHandler } from './get-all-categories.handler';
import { GetCategoriesRootHandler } from './get-categories-root.handler';
import { GetCategoryBySlugHandler } from './get-category-by-slug.handler';
export const CategoryQueryHandlers = [
  GetAllCategoriesHandler,
  GetCategoriesRootHandler,
  GetCategoryBySlugHandler,
];
