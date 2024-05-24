import { seeder } from 'nestjs-seeder';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Category,
  CategorySchema,
} from './modules/category/repository/category.schema';
import { CategorySeeder } from './db/seeds/categories.seeder';

seeder({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://kien2572001:hdvKgpGI5vnpcIZJ@ecommerce-microservices.jazgfcn.mongodb.net/product-service?retryWrites=true&w=majority&appName=ecommerce-microservices-mongodb',
    ),
    MongooseModule.forFeature([
      {
        name: Category.name,
        schema: CategorySchema,
      },
    ]),
  ],
}).run([CategorySeeder]);
