import {DataSource, Repository} from "typeorm";
import {OptionEntity} from "./option.entity";
import {Injectable} from "@nestjs/common";

@Injectable()
export class OptionRepository extends Repository<OptionEntity> {
  constructor(
    private dataSource: DataSource
  ) {
    super(OptionEntity, dataSource.createEntityManager());
  }
}