import {DataSource, Repository} from "typeorm";
import {InventoryEntity} from "./inventory.entity";
import {Injectable} from "@nestjs/common";

@Injectable()
export class InventoryRepository extends Repository<InventoryEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(InventoryEntity, dataSource.createEntityManager());
  }
}