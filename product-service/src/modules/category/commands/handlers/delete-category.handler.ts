import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {DeleteCategoryCommand} from "../impl/delete-category.command";
import {CategoryRepository} from "../../repository/category.repository";

@CommandHandler(DeleteCategoryCommand)
export class DeleteCategoryHandler implements ICommandHandler<DeleteCategoryCommand> {
  constructor(
    private readonly categoryRepository: CategoryRepository,
  ) {
  }

  async execute(command: DeleteCategoryCommand) {
    const {category_id} = command;

    // Tìm tất cả các Category con của Category cha cần xóa
    const subCategories = await this.categoryRepository.findSubCategories(category_id);

    // Xóa tất cả các Category con
    for (const subCategory of subCategories) {
      await this.categoryRepository.softDelete(subCategory._id);
    }

    // Xóa Category cha
    return await this.categoryRepository.softDelete(category_id);
  }

}
