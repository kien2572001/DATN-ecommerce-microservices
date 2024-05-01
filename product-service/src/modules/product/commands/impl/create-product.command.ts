import {CreateProductDto} from "../../dtos/product.create.dto";
import {ICommand} from "@nestjs/cqrs";

export class CreateProductCommand implements ICommand {
  constructor(
    public readonly product: CreateProductDto,
    public readonly shop_id: string,
  ) {
  }
}