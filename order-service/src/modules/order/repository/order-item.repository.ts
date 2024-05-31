import { DataSource, Repository } from 'typeorm';
import { OrderItemEntity } from './order-item.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderItemRepository extends Repository<OrderItemEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(OrderItemEntity, dataSource.createEntityManager());
  }
}
