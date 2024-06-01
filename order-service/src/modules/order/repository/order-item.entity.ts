import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity()
export class OrderItemEntity {
  @PrimaryGeneratedColumn()
  order_item_id: number;

  @Column()
  order_id: number;

  @Column()
  inventory_id: string;

  @Column()
  product_id: string;

  @Column()
  quantity: number;

  @Column()
  price: number;

  @ManyToOne(() => OrderEntity, (order) => order.order_items)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
