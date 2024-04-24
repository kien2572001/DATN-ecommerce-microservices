import {Injectable} from "@nestjs/common";
import {ShopRepository} from "./repository/shop.repository";

@Injectable()
export class ShopService {
  constructor(
    private readonly shopRepository: ShopRepository
  ) {

  }

  async getShopById(id: string) {
    return await this.shopRepository.findById(id);
  }

  async createShop(body: any) {
    return this.shopRepository.create(body);
  }

  async checkExistingShop(userId: string) {
    const isShopExists = await this.shopRepository.existsByUserId(userId);
    return isShopExists;
  }
}