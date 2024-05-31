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

seeder({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://kien2572001:hdvKgpGI5vnpcIZJ@ecommerce-microservices.jazgfcn.mongodb.net/user-service?retryWrites=true&w=majority&appName=ecommerce-microservices-mongodb',
    ),
    MongooseModule.forFeature([
      { name: UserEntity.name, schema: UserSchema },
      { name: ShopEntity.name, schema: ShopSchema },
    ]),
  ],
}).run([UserSeeder]);
