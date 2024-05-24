import { Seeder, DataFactory } from 'nestjs-seeder';
import { Injectable } from '@nestjs/common';
import {
  Category,
  CategorySchema,
} from 'src/modules/category/repository/category.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { categoriesSeedData } from './data/categories.data';
import slugify from 'slugify';
@Injectable()
export class CategorySeeder implements Seeder {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}

  async seed() {
    console.log('Seeding categories...');
    for (const category of categoriesSeedData) {
      await this.saveCategory(category);
    }
  }

  async drop() {
    await this.categoryModel.deleteMany({});
    console.log('Dropping categories...');
  }

  private async saveCategory(category: any, parent_id?: string) {
    let timestamp = new Date().getTime();
    let newCategory = await this.categoryModel.create(category);
    newCategory.category_slug = slugify(
      category.category_name + '-' + timestamp,
    );
    if (parent_id) {
      const parent = await this.categoryModel.findOne({ _id: parent_id });
      newCategory.path = parent.path + '/' + newCategory._id.toString();
    } else {
      newCategory.path = '/' + newCategory._id.toString();
    }
    await newCategory.save();
    console.log('Created category:', newCategory.category_name);
    if (category.children && category.children.length > 0) {
      for (const child of category.children) {
        await this.saveCategory(child, newCategory._id);
      }
    }
  }
}
