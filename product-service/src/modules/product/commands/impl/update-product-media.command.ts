import { ICommand } from '@nestjs/cqrs';

export class UpdateProductMediaCommand implements ICommand {
  constructor(
    public readonly product_id: string,
    public readonly files: Array<Express.Multer.File>,
  ) {}
}
