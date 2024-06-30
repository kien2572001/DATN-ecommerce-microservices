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
import { AddressService } from 'src/modules/address/address.service';
import { faker } from '@faker-js/faker';

@Injectable()
export class UserSeeder implements Seeder {
  constructor(
    @InjectModel(UserEntity.name) private readonly userModel: Model<UserEntity>,
    @InjectModel(ShopEntity.name) private readonly shopModel: Model<ShopEntity>,
    private readonly addressService: AddressService,
  ) {}

  async seed(): Promise<any> {
    // Generate users

    const address = await this.seedRandomAddress(30);
    console.log(address);
    const users = DataFactory.createForClass(UserEntity)
      .generate(500)
      .map((user) => ({
        ...user,
        role: 'buyer',
        address: address[Math.floor(Math.random() * address.length)],
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
      .generate(100)
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
          address: address[Math.floor(Math.random() * address.length)],
        }));

      await this.shopModel.insertMany(shops);
    });
  }

  async drop(): Promise<any> {
    await this.userModel.deleteMany({});
    await this.shopModel.deleteMany({});
  }

  private async seedRandomAddress(numberOfAddresses: number) {
    const addresses = [];
    const cities = await this.addressService.getCities();
    for (let i = 0; i < numberOfAddresses; i++) {
      const cityId = cities[Math.floor(Math.random() * cities.length)].id;
      const cityName = cities.find((city) => city.id === cityId).name;
      const districts = await this.addressService.getDistricts(cityId);
      const districtId =
        districts[Math.floor(Math.random() * districts.length)].id;
      const districtName = districts.find(
        (district) => district.id === districtId,
      ).name;
      const wards = await this.addressService.getWards(districtId);
      const wardId = wards[Math.floor(Math.random() * wards.length)].id;
      const wardName = wards.find((ward) => ward.id === wardId).name;
      const street = faker.location.streetAddress();
      addresses.push({
        city: cityId,
        district: districtId,
        ward: wardId,
        street: street,
        full_address: `${street}, ${wardName}, ${districtName}, ${cityName}`,
        phone: faker.phone.number(),
        name: faker.person.fullName(),
      });
    }
    return addresses;
  }
}
