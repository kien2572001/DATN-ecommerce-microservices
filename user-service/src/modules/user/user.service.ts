import {Injectable} from "@nestjs/common";
import {UserRepository} from "./repository/user.repository";
import {UserCreateByEmailDto} from "./dtos/user.by-email.create.dto";
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as process from "node:process";
import {ShopService} from "../shop/shop.service";


@Injectable()
export class UserService {

  private static shopService: ShopService;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly shopService: ShopService
  ) {
    UserService.shopService = shopService;
  }

  async getUserById(id: string) {
    return await this.userRepository.findById(id);
  }

  async createByEmail(body: UserCreateByEmailDto) {
    body.password = await bcrypt.hash(body.password, 10);
    return this.userRepository.createByEmail(body);
  }

  async checkExistingEmail(email: string) {
    const isEmailExists = await this.userRepository.existsByEmail(email);
    return isEmailExists;
  }

  async findByEmail(email: string) {
    return await this.userRepository.findByEmail(email);
  }

  async checkPassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }

  static async generateAccessToken(payload: any): Promise<string> {
    payload.kid = process.env.KONG_JWT_KID;
    payload.role = payload.role;
    //find shop by user id
    const shop = await this.shopService.getShopByUserId(payload._id);
    if (shop) {
      payload.shop_id = shop._id;
    }
    return await jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '1h'});
  }
}