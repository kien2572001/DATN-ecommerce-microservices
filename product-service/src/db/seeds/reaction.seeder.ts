import { Seeder, DataFactory } from 'nestjs-seeder';
import { Injectable } from '@nestjs/common';
import {
  Review,
  ReviewSchema,
} from 'src/modules/review/repository/review.schema';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Product,
  ProductSchema,
} from 'src/modules/product/repository/product.schema';
import { HttpService } from '@nestjs/axios';
import { faker } from '@faker-js/faker';
@Injectable()
export class ReviewSeeder implements Seeder {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  async seed() {
    // Lấy danh sách các sản phẩm và người mua
    const listProductIds = await this.productModel.find({}, '_id');
    const listBuyerIds = await this.getListUserIds();

    const listReviews = [];

    // Tạo review ngẫu nhiên cho mỗi sản phẩm
    listProductIds.forEach((product) => {
      // Random số lượng review từ 10 đến 20
      const reviewCount = Math.floor(Math.random() * 11) + 10;

      for (let i = 0; i < reviewCount; i++) {
        // Random số lượng reactions từ 0 đến số lượng người mua
        const reactionCount = Math.floor(Math.random() * listBuyerIds.length);
        // Lấy các user_id ngẫu nhiên từ listBuyerIds cho reactions
        const reactions = [];
        const usedIndices = new Set();

        while (reactions.length < reactionCount) {
          const randomIndex = Math.floor(Math.random() * listBuyerIds.length);
          if (!usedIndices.has(randomIndex)) {
            usedIndices.add(randomIndex);
            reactions.push(listBuyerIds[randomIndex]);
          }
        }

        listReviews.push({
          product_id: product._id,
          user_id:
            listBuyerIds[Math.floor(Math.random() * listBuyerIds.length)],
          rating: faker.helpers.arrayElement([1, 2, 3, 4, 5]),
          comment: faker.lorem.sentence(),
          reactions: reactions,
        });
      }
    });

    // Chèn các review vào database
    await this.reviewModel.insertMany(listReviews);

    console.log('Seeding reviews...');
  }

  async drop() {
    await this.reviewModel.deleteMany({});
    console.log('Dropping reviews...');
  }

  private async getListUserIds() {
    const httpService = new HttpService();
    return httpService.axiosRef
      .get('http://localhost:8081/user/list-user-ids?role=buyer')
      .then((res) => res.data.data)
      .catch((err) => {
        console.log(err);
        return [];
      });
  }
}
