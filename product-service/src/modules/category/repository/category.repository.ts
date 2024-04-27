import {InjectRepository} from "@nestjs/typeorm";
import {DataSource, Repository} from 'typeorm';
import {CategoryEntity} from "./category.entity";
import {Injectable} from "@nestjs/common";

@Injectable()
export class CategoryRepository extends Repository<CategoryEntity> {
  constructor(
    private dataSource: DataSource
  ) {
    super(CategoryEntity, dataSource.createEntityManager());
  }
}