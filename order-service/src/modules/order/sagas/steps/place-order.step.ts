import { Inject, Injectable } from '@nestjs/common';
import { OrderService } from '../../order.service';
import { CreateOrderDto } from '../../dtos/order.create.dto';
@Injectable()
export class PlaceOrderStep {
  name: string;
  constructor(@Inject(OrderService) private orderService: OrderService) {
    this.name = 'PlaceOrderStep';
  }
  async invoke(order: CreateOrderDto): Promise<any> {
    console.log('PlaceOrderStep invoked');
    return 'PlaceOrderStep invoked';
  }
  async withCompensation(order: CreateOrderDto): Promise<any> {
    console.log('PlaceOrderStep compensation invoked');
    return 'PlaceOrderStep compensation invoked';
  }
}
