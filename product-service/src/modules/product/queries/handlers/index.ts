import { GetProductBySlugHandler } from './get-product-by-slug.handler';
import { GetProductByIdHandler } from './get-product-by-id.handler';
import { GetProductListForSellerHandler } from './get-product-list-for-seller.handler';
import { GetProductByListIdsHandler } from './get-product-by-list-ids.handler';
export const ProductQueryHandlers = [
  GetProductBySlugHandler,
  GetProductByIdHandler,
  GetProductListForSellerHandler,
  GetProductByListIdsHandler,
];
