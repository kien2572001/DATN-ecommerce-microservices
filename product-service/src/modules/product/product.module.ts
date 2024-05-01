import {Module} from "@nestjs/common";
import {TypeOrmModule} from '@nestjs/typeorm';
import {ProductEntity} from './repository/product.entity';
import {FileService} from "../../utilities/file.service";
import {UtilitiesModule} from "../../utilities/utilities.module";
import {ProductPrivateController} from "./controllers/product.private.controller";
import {CqrsModule} from "@nestjs/cqrs";
import {ProductCommandHandlers} from "./commands/handlers";
import {CommandBus} from "@nestjs/cqrs";
import {ProductRepository} from "./repository/product.repository";
import {CategoryModule} from "../category/category.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity]),
    UtilitiesModule,
    CqrsModule,
    CategoryModule,
  ],
  controllers: [ProductPrivateController],
  providers: [
    FileService,
    CommandBus,
    ProductRepository,
    ...ProductCommandHandlers,
  ],
  exports: [
    ProductRepository,
  ],
})

export class ProductModule {
}
