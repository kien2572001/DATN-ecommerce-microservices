import {Module} from "@nestjs/common";
import {FileService} from "../../utilities/file.service";
import {UtilitiesModule} from "../../utilities/utilities.module";
import {ProductPrivateController} from "./controllers/product.private.controller";
import {ProductPublicController} from "./controllers/product.public.controller";
import {CqrsModule} from "@nestjs/cqrs";
import {ProductCommandHandlers} from "./commands/handlers";
import {ProductQueryHandlers} from "./queries/handlers";
import {CommandBus, QueryBus} from "@nestjs/cqrs";
import {CategoryModule} from "../category/category.module";
import {MongooseModule} from "@nestjs/mongoose";
import {Product, ProductSchema} from "./repository/product.schema";
import {ProductRepository} from "./repository/product.repository";
import {Classification, ClassificationSchema} from "./repository/classification.schema";
import {ClassificationRepository} from "./repository/classification.repository";
import {InventoryModule} from "../inventory/inventory.module";

@Module({
  imports: [
    UtilitiesModule,
    CqrsModule,
    CategoryModule,
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: Classification.name,
        schema: ClassificationSchema,
      },
    ]),
    InventoryModule,
  ],
  controllers: [
    ProductPrivateController,
    ProductPublicController,
  ],
  providers: [
    FileService,
    CommandBus,
    QueryBus,
    ...ProductQueryHandlers,
    ...ProductCommandHandlers,
    ProductRepository,
    ClassificationRepository,
  ],
  exports: [
    ProductRepository,
    ClassificationRepository,
  ],
})

export class ProductModule {
}
