import {CreateCategoryDto} from "../../dtos/category.create.dto";
import {ICommand} from "@nestjs/cqrs";

export class CreateCategoryCommand implements ICommand {
  constructor(
    public readonly category: CreateCategoryDto,
    public readonly shop_id?: string,
  ) {
  }
}