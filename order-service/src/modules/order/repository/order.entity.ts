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
  shipping_fee: number;

  @Column()
  payment_method: string;

  @Column()
  status: string;

  @Column()
  total: number;

  @OneToMany(() => OrderItemEntity, (orderItem) => orderItem.order, {
    cascade: true,
  })
  @JoinColumn()
  order_items: OrderItemEntity[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
