import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {ShopRepository} from "./shop.repository";
import {ShopEntity, ShopSchema} from "./shop.entity";

@Module({
  providers: [ShopRepository],
  exports: [ShopRepository],
  imports: [
    MongooseModule.forFeature([
      {name: ShopEntity.name, schema: ShopSchema}
    ])
  ]
})
export class ShopRepositoryModule {
}