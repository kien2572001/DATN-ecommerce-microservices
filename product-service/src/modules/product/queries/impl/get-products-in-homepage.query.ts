import { IQuery } from '@nestjs/cqrs';

export class GetProductsHomepageQuery implements IQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly keyword: string,
    public readonly category_slug: string,
    public readonly trending: string,
    public readonly popular: string,
    public readonly newArrival: string,
  ) {}
}
