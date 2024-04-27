import {Module} from "@nestjs/common";
import {TypeOrmModule} from '@nestjs/typeorm';
import {CategoryEntity} from './repository/category.entity';
import {UtilitiesModule} from "../../utilities/utilities.module";

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity]), UtilitiesModule],
})
export class CategoryModule {
}