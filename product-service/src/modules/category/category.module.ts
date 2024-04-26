import {Module} from "@nestjs/common";
import {TypeOrmModule} from '@nestjs/typeorm';
import {CategoryEntity} from './repository/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity])],
})
export class CategoryModule {
}