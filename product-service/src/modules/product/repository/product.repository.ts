import {DataSource, Repository} from "typeorm";
import {ProductEntity} from "./product.entity";
import {Injectable} from "@nestjs/common";

@Injectable()
export class ProductRepository extends Repository<ProductEntity> {
  constructor(
    private dataSource: DataSource
  ) {
    super(ProductEntity, dataSource.createEntityManager());
  }
}