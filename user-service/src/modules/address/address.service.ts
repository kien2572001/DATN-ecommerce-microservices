import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddressEntity, AddressSchema } from './address.entity';
@Injectable()
export class AddressService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(AddressEntity.name)
    private readonly addressModel: Model<AddressEntity>,
  ) {}

  async getCities() {
    // return this.httpService
    //   .axiosRef({
    //     method: 'get',
    //     url: 'http://sandbox.goship.io/api/v2/cities',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: 'Bearer ' + process.env.GOSHIP_API_TOKEN,
    //     },
    //   })
    //   .then((res) => {
    //     return res.data.data;
    //   })
    //   .catch((err) => {
    //     console.log('err', err);
    //   });
    return await this.addressModel
      .find({ type: 'city' })
      .select('-createdAt -updatedAt -__v');
  }

  async getDistricts(cityId: string) {
    // return this.httpService
    //   .axiosRef({
    //     method: 'get',
    //     url: `http://sandbox.goship.io/api/v2/cities/${cityId}/districts`,
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: 'Bearer ' + process.env.GOSHIP_API_TOKEN,
    //     },
    //   })
    //   .then((res) => {
    //     return res.data.data;
    //   })
    //   .catch((err) => {
    //     console.log('err', err);
    //   });
    return await this.addressModel
      .find({ type: 'district', city_id: cityId })
      .select('-createdAt -updatedAt -__v');
  }

  async getWards(districtId: string) {
    // return this.httpService
    //   .axiosRef({
    //     method: 'get',
    //     url: `http://sandbox.goship.io/api/v2/districts/${districtId}/wards`,
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: 'Bearer ' + process.env.GOSHIP_API_TOKEN,
    //     },
    //   })
    //   .then((res) => {
    //     return res.data.data;
    //   })
    //   .catch((err) => {
    //     console.log('err', err);
    //   });
    return await this.addressModel
      .find({ type: 'ward', district_id: districtId })
      .select('-createdAt -updatedAt -__v');
  }

  async crawAddressData() {
    console.log('crawAddressData');
    const cities = await this.getCities();
    let willSaveData = [];
    for (const city of cities) {
      willSaveData.push({
        id: city.id,
        type: 'city',
        name: city.name,
      });
      await this.delay(300);
      const districts = await this.getDistricts(city.id);
      for (const district of districts) {
        willSaveData.push({
          id: district.id,
          type: 'district',
          name: district.name,
          city_id: city.id,
        });
        await this.delay(300);
        const wards = await this.getWards(district.id);
        for (const ward of wards) {
          willSaveData.push({
            id: ward.id,
            type: 'ward',
            name: ward.name,
            district_id: district.id,
          });
        }
      }
    }
    return await this.addressModel.insertMany(willSaveData);
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
