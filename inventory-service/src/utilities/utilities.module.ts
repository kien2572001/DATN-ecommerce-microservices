import {Module} from "@nestjs/common";
import {ResponseHandler} from "./response.handler";


@Module({
  providers: [ResponseHandler],
  exports: [ResponseHandler]
})

export class UtilitiesModule {
}
