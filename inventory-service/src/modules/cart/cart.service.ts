import {Injectable} from "@nestjs/common";
import {CartRepository} from "./repository/cart.repository";
import {CartDto} from "./dtos/cart.dto";
import {CartItemDto} from "./dtos/cart-item.dto";

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository
  ) {
  }

  async getOrCreateCart(userId: string) {
    return await this.cartRepository.getOrCreateCart(userId);
  }

  async addProductToCart(userId: string, product: CartItemDto) {
    return await this.cartRepository.addProductToCart(userId, product);
  }

  async removeProductFromCart(userId: string, productId: string) {
    return await this.cartRepository.removeProductFromCart(userId, productId);
  }

  async removeCart(userId: string) {
    return await this.cartRepository.removeCart(userId);
  }
}