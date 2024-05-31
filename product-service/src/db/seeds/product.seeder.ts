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

  async seed() {
    //get categories level 0
    const categories = await this.categoryModel.find({ level: 0 });
    let shopIds = await this.getListShopIds();
    shopIds = shopIds.map((shopId) => shopId._id);
    for (let i = 0; i < categories.length; i++) {
      for (let j = 0; j < 20; j++) {
        await this.createProduct(shopIds[i], categories[i]._id.toString());
      }
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
      images: await this.randomImages(),
      is_has_many_classifications: false,
      inventory: {
        price: Number(faker.commerce.price()),
        quantity: faker.number.int({
          min: 1,
          max: 100,
        }),
      },
      classifications: [],
      inventories: [],
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

  private async randomImages() {
    const images = [];
    const size = faker.number.int({ min: 3, max: 8 });
    for (let i = 0; i < size; i++) {
      images.push({
        _id: uuidv4(),
        url: faker.image.url({ width: 480, height: 480 }),
      });
    }
    return images;
  }

  private async getListShopIds() {
    const httpService = new HttpService();
    return httpService.axiosRef
      .get('http://localhost:8081/public/shop/list-shop-ids')
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
