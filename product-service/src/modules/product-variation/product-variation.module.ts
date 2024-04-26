import {Module} from "@nestjs/common";
import {TypeOrmModule} from '@nestjs/typeorm';
import {ProductVariationEntity} from "./repository/product-variation.entity";
import {OptionEntity} from "./repository/option.entity";
import {VariationEntity} from "./repository/variation.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ProductVariationEntity, OptionEntity, VariationEntity])],
  controllers: [],
  providers: [],
  exports: []
})
export class ProductVariationModule {

}