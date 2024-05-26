import { ICommand } from '@nestjs/cqrs';

export class DeleteProductByIdCommand implements ICommand {
  constructor(public readonly id: string) {}
}
