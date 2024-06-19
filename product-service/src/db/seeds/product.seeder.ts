import { Seeder, DataFactory } from 'nestjs-seeder';
import { Injectable } from '@nestjs/common';
import {
  Category,
  CategorySchema,
} from 'src/modules/category/repository/category.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import slugify from 'slugify';
import { CommandBus } from '@nestjs/cqrs';
import { CreateProductCommand } from 'src/modules/product/commands/impl/create-product.command';
import {
  Product,
  ProductSchema,
} from 'src/modules/product/repository/product.schema';
import { CreateProductDto } from 'src/modules/product/dtos/product.create.dto';
import { faker } from '@faker-js/faker';
import { HttpService } from '@nestjs/axios';
import { ProductCommandHandlers } from 'src/modules/product/commands/handlers';
import { v4 as uuidv4 } from 'uuid';
import { InventoryService } from 'src/modules/inventory/inventory.service';
import { CreateInventoryDto } from 'src/modules/inventory/dtos/inventory.create.dto';
@Injectable()
export class ProductSeeder implements Seeder {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    private readonly inventoryService: InventoryService,
  ) {}

  async randomImagesArray() {
    const count = faker.number.int({ min: 4, max: 8 });
    const images = [];
    for (let i = 0; i < count; i++) {
      const randomInt = faker.number.int({ min: 1, max: 41 });
      images.push({
        _id: uuidv4(),
        url: `https://ecomerce-microservices-bk.s3.ap-southeast-1.amazonaws.com/product-service/sample/${randomInt}.jpeg`,
      });
    }
    return images;
  }

  async seed() {
    //get categories level 0
    const categories = await this.categoryModel.find({});
    let shopIds = await this.getListShopIds();
    shopIds = shopIds.map((shopId) => shopId._id);
    // console.log('shopIds', shopIds);

    const PRODUCT_COUNT = 50000;
    for (let i = 0; i < PRODUCT_COUNT; i++) {
      const shopId: string = faker.helpers.arrayElement(shopIds);
      const category_id = faker.helpers.arrayElement(categories)._id.toString();
      await this.createProduct(shopId, category_id);
    }

    console.log('Seeding products...');
  }

  async drop() {
    await this.productModel.deleteMany({});
    console.log('Dropping products...');
  }

  private async createProduct(shopId: string, category_id: string) {
    const timestamp = new Date().getTime();
    const product_name = faker.commerce.productName();
    const product: any = {
      shop_id: shopId,
      category: category_id,
      product_name: product_name,
      product_slug: slugify(product_name + '-' + timestamp),
      product_description: faker.commerce.productDescription(),
      status: 'active',
      shipping_information: {
        weight: faker.number.int({
          min: 100,
          max: 1000,
        }),
        length: faker.number.int({
          min: 100,
          max: 1000,
        }),
        width: faker.number.int({
          min: 100,
          max: 1000,
        }),
        height: faker.number.int({
          min: 10,
          max: 100,
        }),
      },
      product_variants: [
        {
          name: 'Stand Up',
          value: '35″L x 24″W x 37-45″H(front to back wheel)',
        },
        {
          name: 'Folded (w/o wheels)',
          value: '32.5″L x 18.5″W x 16.5″H',
        },
        {
          name: 'Door Pass Through',
          value: '24',
        },
        {
          name: 'Frame',
          value: 'Aluminum',
        },
        {
          name: 'Weight Capacity',
          value: '110 lbs',
        },
        {
          name: 'Wheel Size',
          value: '6″',
        },
        {
          name: 'Stroller Weight',
          value: '13 lbs',
        },
        {
          name: 'Colors',
          value: 'Black, Blue, Red, Pink, Green, Orange',
        },
      ],
      images: await this.randomImagesArray(),
      is_has_many_classifications: false,
      // inventory: {
      //   price: Number(faker.commerce.price()),
      //   quantity: faker.number.int({
      //     min: 1,
      //     max: 100,
      //   }),
      // },
      classifications: [],
      // inventories: [],
      sold_quantity: faker.number.int({
        min: 0,
        max: 20000,
      }),
      rating: faker.number.int({
        min: 1,
        max: 5,
      }),
      total_reviews: faker.number.int({
        min: 0,
        max: 1000,
      }),
      total_views: faker.number.int({
        min: 1000,
        max: 10000,
      }),
      trending_score: faker.number.int({
        min: 0,
        max: 100,
      }),
      popular_score: faker.number.int({
        min: 0,
        max: 100,
      }),
    };

    const createdProduct = await this.productModel.create(product);
    const inventory = {
      product_id: createdProduct._id,
      price: Number(faker.commerce.price()) * 1000,
      quantity: faker.number.int({
        min: 1,
        max: 100,
      }),
    } as CreateInventoryDto;
    const createdInventory: any =
      await this.inventoryService.createInventory(inventory);
    createdProduct.inventory_id = createdInventory.inventory_id;
    createdProduct.price = createdInventory.price;
    await createdProduct.save();
  }

  private async getListShopIds() {
    const httpService = new HttpService();
    return httpService.axiosRef
      .get('http://localhost:8011/public/shop/list-shop-ids')
      .then((response) => {
        return response.data.data;
      })
      .catch((error) => {
        throw new Error(
          error.message + ': ' + error.response.data.data.message,
        );
      });
  }
}
