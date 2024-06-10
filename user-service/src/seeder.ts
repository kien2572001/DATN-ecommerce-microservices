import { seeder } from 'nestjs-seeder';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserEntity,
  UserSchema,
} from 'src/modules/user/repository/user.entity';
import { UserSeeder } from './db/seeds/users.seeder';
import {
  ShopEntity,
  ShopSchema,
} from 'src/modules/shop/repository/shop.entity';
import { AddressModule } from './modules/address/address.module';
seeder({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/user-service'),
    MongooseModule.forFeature([
      { name: UserEntity.name, schema: UserSchema },
      { name: ShopEntity.name, schema: ShopSchema },
    ]),
    AddressModule,
  ],
}).run([UserSeeder]);
