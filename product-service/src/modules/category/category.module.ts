import { Module } from '@nestjs/common';
import { UtilitiesModule } from '../../utilities/utilities.module';
import { CategoryPrivateController } from './controllers/category.private.controller';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CategoryCommandHandlers } from './commands/handlers';
import { CqrsModule } from '@nestjs/cqrs';
import { Category, CategorySchema } from './repository/category.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryRepository } from './repository/category.repository';
import { CategorySeeder } from '../../db/seeds/categories.seeder';
import { CategoryQueryHandlers } from './queries/handlers';
@Module({
  imports: [
    UtilitiesModule,
    CqrsModule,
    MongooseModule.forFeature([
      {
        name: Category.name,
        schema: CategorySchema,
      },
    ]),
  ],
  controllers: [CategoryPrivateController],
  providers: [
    CommandBus,
    ...CategoryCommandHandlers,
    QueryBus,
    ...CategoryQueryHandlers,
    CategoryRepository,
  ],
  exports: [CategoryRepository],
})
export class CategoryModule {}
