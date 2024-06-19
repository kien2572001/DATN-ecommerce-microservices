import { IQuery } from '@nestjs/cqrs';

export class GetCategoryBySlugQuery implements IQuery {
  constructor(public readonly slug: string) {}
}
