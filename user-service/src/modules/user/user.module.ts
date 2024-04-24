import {Module} from '@nestjs/common';
import {UserController} from './controllers/user.controller';
import {AuthController} from "./controllers/auth.controller";
import {UserService} from "./user.service";
import {UserRepositoryModule} from "./repository/user.repository.module";
import {UtilitiesModule} from "../../utilities/utilities.module";

@Module({
  imports: [UserRepositoryModule, UtilitiesModule],
  controllers: [UserController, AuthController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {

}
