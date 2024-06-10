import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShopEntity, ShopSchema } from './shop.entity';

@Injectable()
export class ShopRepository {
  constructor(
    @InjectModel(ShopEntity.name) private shopModel: Model<ShopEntity>,
  ) {}

  async findAll(filter: any) {
    return this.shopModel.find(filter).lean();
  }

  async findByListIds(ids: string[], populate = [], includes = []) {
    let query = this.shopModel.find({ _id: { $in: ids } });
    if (populate.length) {
      query = query.populate(populate.join(' '));
    }
    if (includes.length) {
      query = query.select(includes.join(' '));
    }
    return query.lean();
  }

  async findById(id: string, populateUser = false) {
    let query = this.shopModel.findById(id);
    if (populateUser) {
      query = query.populate('user_id');
    }
    return query.lean();
  }

  async findAddressById(id: string) {
    return this.shopModel.findById(id).select('address').lean();
  }

  async findByUserId(userId: string) {
    return this.shopModel.findOne({ user_id: userId }).lean();
  }

  async create(body: any) {
    return this.shopModel.create(body);
  }

  async existsByUserId(userId: string) {
    return this.shopModel.exists({ user_id: userId });
  }
}
