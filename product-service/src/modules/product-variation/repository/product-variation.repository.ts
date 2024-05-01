import {DataSource, Repository} from "typeorm";
import {ProductVariationEntity} from "./product-variation.entity";
import {Injectable} from "@nestjs/common";

@Injectable()
export class ProductVariationRepository extends Repository<ProductVariationEntity> {
  constructor(
    private dataSource: DataSource
  ) {
    super(ProductVariationEntity, dataSource.createEntityManager());
  }
}