import { IQuery } from '@nestjs/cqrs';

export class GetProductByIdQuery implements IQuery {
  constructor(public readonly product_id: string) {}
}
