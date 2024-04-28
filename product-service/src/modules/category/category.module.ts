import {Module} from "@nestjs/common";
import {TypeOrmModule} from '@nestjs/typeorm';
import {CategoryEntity} from './repository/category.entity';
import {UtilitiesModule} from "../../utilities/utilities.module";
import {CategoryPrivateController} from "./controllers/category.private.controller";
import {CommandBus} from "@nestjs/cqrs";
import {CategoryCommandHandlers} from './commands/handlers';
import {CategoryRepository} from "./repository/category.repository";
import {CqrsModule} from "@nestjs/cqrs";

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryEntity]),
    UtilitiesModule,
    CqrsModule,
  ],
  controllers: [CategoryPrivateController],
  providers: [
    CommandBus,
    CategoryRepository,
    ...CategoryCommandHandlers,
  ],
  exports: [],
})
export class CategoryModule {
}