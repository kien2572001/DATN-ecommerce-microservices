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
import { CategorySeeder } from './db/seeds/categories.seeder';

seeder({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/product-service'),
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
}).run([CategorySeeder, ProductSeeder, ReviewSeeder]);
