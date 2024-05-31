import { seeder } from 'nestjs-seeder';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Category,
  CategorySchema,
} from './modules/category/repository/category.schema';
import { ProductSeeder } from './db/seeds/product.seeder';
import {
  Product,
  ProductSchema,
} from './modules/product/repository/product.schema';
import { InventoryModule } from './modules/inventory/inventory.module';
import {
  Review,
  ReviewSchema,
} from './modules/review/repository/review.schema';
import { ReviewSeeder } from './db/seeds/reaction.seeder';

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
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: Review.name,
        schema: ReviewSchema,
      },
    ]),
    InventoryModule,
  ],
}).run([ProductSeeder, ReviewSeeder]);
