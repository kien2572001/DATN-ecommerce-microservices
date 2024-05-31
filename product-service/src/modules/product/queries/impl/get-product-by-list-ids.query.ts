import { IQuery } from '@nestjs/cqrs';

export class GetProductByListIdsQuery implements IQuery {
  constructor(
    public readonly ids: string[],
    public readonly populate: string[] = [],
    public readonly includes: string[] = [],
  ) {}
}
