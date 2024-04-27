import {CreateCategoryDto} from "../../dtos/category.create.dto";

export class CreateCategoryCommand {
  constructor(
    public readonly category: CreateCategoryDto,
    public readonly shop_id?: string,
  ) {
  }
}