import { UpdateProductDto } from '../../dtos/product.update.dto';
import { ICommand } from '@nestjs/cqrs';

export class UpdateProductCommand implements ICommand {
  constructor(
    public readonly product: UpdateProductDto,
    public readonly shop_id: string,
  ) {}
}
