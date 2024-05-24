import { IQuery } from '@nestjs/cqrs';

export class GetAllCategoriesQuery implements IQuery {
  constructor() {}
}
