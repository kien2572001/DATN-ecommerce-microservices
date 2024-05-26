import { IQuery } from '@nestjs/cqrs';

export class GetProductListForSellerQuery implements IQuery {
  constructor(
    public readonly seller_id: string,
    public readonly page: number,
    public readonly limit: number,
  ) {}
}
