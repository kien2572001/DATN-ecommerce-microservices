import {Category} from "./category.schema";
import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {BaseAbstractRepository} from "../../../base/base.abstract.repository";

@Injectable()
export class CategoryRepository extends BaseAbstractRepository<Category> {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>
  ) {
    super(categoryModel);
  }

  async findSubCategories(parent_path: string): Promise<Category[]> {
    return this.categoryModel.find({path: new RegExp('^' + parent_path)}).exec();
  }

  async findBySlug(slug: string): Promise<Category> {
    return this.categoryModel.findOne({category_slug: slug}).exec();
  }
}