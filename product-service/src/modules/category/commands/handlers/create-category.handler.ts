import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {CreateCategoryCommand} from "../impl/create-category.command";
import {clc} from "@nestjs/common/utils/cli-colors.util";
import {CategoryRepository} from "../../repository/category.repository";
import slugify from "slugify";

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler implements ICommandHandler<CreateCategoryCommand> {
  constructor(
    private readonly categoryRepository: CategoryRepository
  ) {
  }

  async execute(command: CreateCategoryCommand) {
    const {category, shop_id} = command;
    const timestamp = new Date().getTime();
    const newCategory = this.categoryRepository.create({
      category_name: category.category_name,
      category_thumb: category.category_thumb,
      category_slug: slugify(category.category_name + '-' + timestamp),
      shop_id: shop_id,
    });
    await this.categoryRepository.save(newCategory);
    await this.populateCategoryPathAndLevel(newCategory);
    await this.categoryRepository.save(newCategory);
    console.log(clc.green('CreateCategoryCommand...'));
  }

  private async populateCategoryPathAndLevel(category: any) {
    if (category.parent_id) {
      const parent = await this.categoryRepository.findOneOrFail({
        where: {category_id: category.parent_id}
      });
      category.path = parent.path + '/' + category.category_id;
      category.level = parent.level + 1;
    } else {
      category.path = '/' + category.category_id;
      category.level = 0;
    }
  }
}