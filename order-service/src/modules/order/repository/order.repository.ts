import { DataSource, Repository } from 'typeorm';
import { OrderEntity } from './order.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderRepository extends Repository<OrderEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(OrderEntity, dataSource.createEntityManager());
  }
}
