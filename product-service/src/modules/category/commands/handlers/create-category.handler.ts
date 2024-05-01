import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {CreateCategoryCommand} from "../impl/create-category.command";
import {CategoryRepository} from "../../repository/category.repository";
import slugify from "slugify";
import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {InjectEntityManager} from '@nestjs/typeorm';
import {EntityManager} from 'typeorm';
import {CategoryEntity} from "../../repository/category.entity";

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler implements ICommandHandler<CreateCategoryCommand> {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager
  ) {
  }

  async execute(command: CreateCategoryCommand) {
    return await this.entityManager.transaction(async transactionalEntityManager => {
      const {category, shop_id} = command;
      const timestamp = new Date().getTime();
      const newCategory = this.categoryRepository.create({
        category_name: category.category_name,
        category_thumb: category.category_thumb,
        category_slug: slugify(category.category_name + '-' + timestamp),
        shop_id: shop_id,
      });

      await transactionalEntityManager.save(newCategory);
      await this.populateCategoryPathAndLevel(newCategory, category.parent_id, transactionalEntityManager);
      const savedCategory = await transactionalEntityManager.save(newCategory);

      return savedCategory;
    });
  }

  private async populateCategoryPathAndLevel(category: any, parent_id?: number, transactionalEntityManager?: EntityManager) {
    if (parent_id) {
      // @ts-ignore
      const parent = await transactionalEntityManager.findOne(CategoryEntity, {
        where: {category_id: parent_id},
      });

      if (!parent) {
        throw new HttpException('Parent category not found', HttpStatus.NOT_FOUND);
      }

      category.path = parent.path + '/' + category.category_id;
      category.level = parent.level + 1;
    } else {
      category.path = '/' + category.category_id;
      category.level = 0;
    }
  }
}