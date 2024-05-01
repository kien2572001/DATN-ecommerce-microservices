import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {DeleteCategoryCommand} from "../impl/delete-category.command";
import {CategoryRepository} from "../../repository/category.repository";
import {DeleteResult, EntityManager} from "typeorm";
import {InjectEntityManager} from '@nestjs/typeorm';

@CommandHandler(DeleteCategoryCommand)
export class DeleteCategoryHandler implements ICommandHandler<DeleteCategoryCommand> {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager
  ) {
  }

  async execute(command: DeleteCategoryCommand) {
    return await this.entityManager.transaction(async transactionalEntityManager => {
      const {category_id} = command
      const category = await this.categoryRepository.findOneOrFail({
        where: {category_id}
      });
      //delete child category
      const parentPath = category.path;
      const deleteResult: DeleteResult = await this.categoryRepository
        .createQueryBuilder()
        .delete()
        .where("path LIKE :parentPath", {parentPath: `${parentPath}%`})
        .execute();
      //const deleteCount = deleteResult.affected;
      //delete category
      const deletedCategory = await this.categoryRepository.remove(category);
      return deletedCategory;
    });
  }
}
