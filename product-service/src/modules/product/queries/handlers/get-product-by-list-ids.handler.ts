import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ProductRepository } from '../../repository/product.repository';
import { GetProductByListIdsQuery } from '../impl/get-product-by-list-ids.query';

@QueryHandler(GetProductByListIdsQuery)
export class GetProductByListIdsHandler
  implements IQueryHandler<GetProductByListIdsQuery>
{
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(query: GetProductByListIdsQuery) {
    return await this.productRepository.findProductByListIds(
      query.ids,
      query.populate,
      query.includes,
    );
  }
}
