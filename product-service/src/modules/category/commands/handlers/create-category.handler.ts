import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCategoryCommand } from '../impl/create-category.command';
import slugify from 'slugify';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CategoryRepository } from '../../repository/category.repository';

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler
  implements ICommandHandler<CreateCategoryCommand>
{
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(command: CreateCategoryCommand) {
    const { category, shop_id } = command;
    const timestamp = new Date().getTime();
    const newCategory = await this.categoryRepository.create({
      category_name: category.category_name,
      category_thumb: category.category_thumb,
      category_slug: slugify(category.category_name + '-' + timestamp),
      shop_id: shop_id,
    });
    await this.populateCategoryPathAndLevel(newCategory, category.parent_id);
    return this.categoryRepository.update(newCategory._id, newCategory);
  }

  private async populateCategoryPathAndLevel(
    category: any,
    parent_id?: string,
  ) {
    //console.log('populateCategoryPathAndLevel', category._id.toString());
    if (parent_id) {
      const parent = await this.categoryRepository.findOneById(parent_id);

      if (!parent) {
        throw new HttpException(
          'Parent category not found',
          HttpStatus.NOT_FOUND,
        );
      }

      category.path = parent.path + '/' + category._id.toString();
      category.level = parent.level + 1;
    } else {
      category.path = '/' + category._id.toString();
      category.level = 0;
    }
  }
}
