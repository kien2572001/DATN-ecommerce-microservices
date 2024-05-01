import {UpdateProductVariationDto} from "../../dtos/product-variation.update.dto";
import {ICommand} from "@nestjs/cqrs";

export class UpdateProductVariationCommand implements ICommand {
  constructor(
    public readonly product_variation: UpdateProductVariationDto,
    public readonly shop_id: string,
  ) {
  }
}