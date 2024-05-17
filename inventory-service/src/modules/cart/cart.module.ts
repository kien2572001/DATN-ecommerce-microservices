import {Module} from '@nestjs/common';
import {CartPublicController} from "./controllers/cart.public.controller";
import {CartService} from "./cart.service";
import {CartRepository} from "./repository/cart.repository";
import {UtilitiesModule} from "../../utilities/utilities.module";

@Module({
  imports: [
    UtilitiesModule,
  ],
  controllers: [CartPublicController],
  providers: [CartService, CartRepository],
  exports: [CartService, CartRepository]
})
export class CartModule {
  
}