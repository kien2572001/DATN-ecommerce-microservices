import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { OrderItemEntity } from './order-item.entity';

@Entity()
export class OrderEntity {
  @PrimaryGeneratedColumn()
  order_id: number;

  @Column()
  shop_id: string;

  @Column()
  user_id: string;

  @Column('json', { nullable: true })
  shipping_address: Record<string, any>;

  @Column()
  status: string;

  @Column()
  total: number;

  @OneToMany(() => OrderItemEntity, (orderItem) => orderItem.order_id)
  order_items: OrderItemEntity[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
