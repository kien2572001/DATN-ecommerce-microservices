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
import { ConfigModule } from '@nestjs/config';
import configuration from './configs/configuration';
import { ConfigService } from '@nestjs/config';
seeder({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('no_sql_db_uri'),
      }),
      inject: [ConfigService],
    }),
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
}).run([ProductSeeder]);
