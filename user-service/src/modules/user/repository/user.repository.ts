import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserSchema, UserEntity } from './user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(UserEntity.name) private userModel: Model<UserEntity>,
  ) {}

  async getListUserIds(role: string) {
    return this.userModel
      .find({
        role,
      })
      .select('_id')
      .lean();
  }

  async getUserByListIds(ids: string[], includes: string[] = []) {
    return this.userModel
      .find({ _id: { $in: ids } })
      .select(includes.join(' '));
  }

  async findById(id: string) {
    return this.userModel.findById(id).select('-password').lean();
  }

  async createByEmail(body: any) {
    return this.userModel.create(body);
  }

  async existsByEmail(email: string) {
    return this.userModel.exists({ email });
  }

  async findByEmail(email: string) {
    return this.userModel
      .findOne({
        email,
      })
      .lean();
  }

  async getAddressByUserId(userId: string) {
    return this.userModel.findById(userId).select('address').lean();
  }

  async updateAddress(userId: string, address: any) {
    return this.userModel.findByIdAndUpdate(userId, { address });
  }
}
