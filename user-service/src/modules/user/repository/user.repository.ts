import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {UserSchema, UserEntity} from "./user.entity";

@Injectable()
export class UserRepository {
  constructor(@InjectModel(UserEntity.name) private userModel: Model<UserEntity>) {
  }

  async findById(id: string) {
    return this.userModel.findById(id).select('-password').lean();
  }

  async createByEmail(body: any) {
    return this.userModel.create(body);
  }

  async existsByEmail(email: string) {
    return this.userModel.exists({email});
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({
      email
    }).lean();
  }
}