import {IQuery} from "@nestjs/cqrs";


export class GetProductBySlugQuery implements IQuery {
  constructor(
    public readonly product_slug: string,
  ) {
  }
}