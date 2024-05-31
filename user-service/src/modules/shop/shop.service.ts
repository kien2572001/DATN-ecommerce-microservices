import { Injectable } from '@nestjs/common';
import { ShopRepository } from './repository/shop.repository';

@Injectable()
export class ShopService {
  constructor(private readonly shopRepository: ShopRepository) {}

  async getShopByListIds(
    shopIds: string[],
    populate: string[] = [],
    includes: string[] = [],
  ) {
    return await this.shopRepository.findByListIds(shopIds, populate, includes);
  }

  async getListShopIds() {
    return await this.shopRepository.findAll({});
  }

  async getShopById(id: string) {
    return await this.shopRepository.findById(id);
  }

  async getShopByUserId(userId: string) {
    return await this.shopRepository.findByUserId(userId);
  }

  async createShop(body: any) {
    return this.shopRepository.create(body);
  }

  async checkExistingShop(userId: string) {
    const isShopExists = await this.shopRepository.existsByUserId(userId);
    return isShopExists;
  }
}
