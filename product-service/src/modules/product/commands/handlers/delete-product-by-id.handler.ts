import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteProductByIdCommand } from '../impl/delete-product-by-id.command';
import { ProductRepository } from '../../repository/product.repository';

@CommandHandler(DeleteProductByIdCommand)
export class DeleteProductByIdHandler
  implements ICommandHandler<DeleteProductByIdCommand>
{
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: DeleteProductByIdCommand) {
    const { id } = command;
    return await this.productRepository.softDelete(id);
  }
}
