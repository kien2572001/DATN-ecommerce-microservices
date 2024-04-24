import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {ShopEntity, ShopSchema} from "./shop.entity";

@Injectable()
export class ShopRepository {
  constructor(@InjectModel(ShopEntity.name) private shopModel: Model<ShopEntity>) {
  }

  async findById(id: string, populateUser = false) {
    let query = this.shopModel.findById(id);
    if (populateUser) {
      query = query.populate('user_id');
    }
    return query.lean();
  }

  async findByUserId(userId: string) {
    return this.shopModel.findOne({user_id: userId}).lean();
  }

  async create(body: any) {
    return this.shopModel.create(body);
  }

  async existsByUserId(userId: string) {
    return this.shopModel.exists({user_id: userId});
  }
}