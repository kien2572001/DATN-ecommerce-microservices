import {Module} from "@nestjs/common";
import {TypeOrmModule} from '@nestjs/typeorm';
import {ProductVariationEntity} from "./repository/product-variation.entity";
import {OptionEntity} from "./repository/option.entity";
import {ProductVariationRepository} from "./repository/product-variation.repository";
import {OptionRepository} from "./repository/option.repository";
import {ProductVariationPrivateController} from "./controllers/product-variation.private.controller";
import {ProductVariationCommandHandlers} from "./commands/handlers";
import {CommandBus, CqrsModule} from "@nestjs/cqrs";
import {UtilitiesModule} from "../../utilities/utilities.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductVariationEntity, OptionEntity]),
    CqrsModule,
    UtilitiesModule,
  ],
  controllers: [
    ProductVariationPrivateController,
  ],
  providers: [
    ProductVariationRepository,
    OptionRepository,
    CommandBus,
    ...ProductVariationCommandHandlers,
  ],
  exports: [
    ProductVariationRepository,
    OptionRepository,
  ]
})
export class ProductVariationModule {
}