import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Seeder, DataFactory } from 'nestjs-seeder';
import {
  UserEntity,
  UserSchema,
} from 'src/modules/user/repository/user.entity';
import {
  ShopEntity,
  ShopSchema,
} from './../../modules/shop/repository/shop.entity';

@Injectable()
export class UserSeeder implements Seeder {
  constructor(
    @InjectModel(UserEntity.name) private readonly userModel: Model<UserEntity>,
    @InjectModel(ShopEntity.name) private readonly shopModel: Model<ShopEntity>,
  ) {}

  async seed(): Promise<any> {
    // Generate users
    const users = DataFactory.createForClass(UserEntity)
      .generate(500)
      .map((user) => ({
        ...user,
        role: 'buyer',
      }));

    // Generate admin and sellers
    const admin = DataFactory.createForClass(UserEntity)
      .generate(1)
      .map((user) => ({
        ...user,
        username: 'admin',
        email: 'admin@gmail.com',
        role: 'admin',
      }));

    const sellers = DataFactory.createForClass(UserEntity)
      .generate(10)
      .map((user) => ({
        ...user,
        role: 'seller',
      }));

    // Insert users into the database
    await this.userModel.insertMany([...users, ...admin, ...sellers]);

    // Create shop for each seller
    await this.userModel.find({ role: 'seller' }).then(async (sellers) => {
      const shops = DataFactory.createForClass(ShopEntity)
        .generate(sellers.length)
        .map((shop, index) => ({
          ...shop,
          user_id: sellers[index]._id,
        }));

      await this.shopModel.insertMany(shops);
    });
  }

  async drop(): Promise<any> {
    await this.userModel.deleteMany({});
    await this.shopModel.deleteMany({});
  }
}
