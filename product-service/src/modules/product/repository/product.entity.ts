import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import {CategoryEntity} from "../../category/repository/category.entity";
import {ProductStatusEnum} from "../../../enums/productStatus.enum";

@Entity()
export class ProductEntity {
  @PrimaryGeneratedColumn()
  product_id: number;

  @Column()
  product_name: string;

  @Column()
  product_slug: string;

  @Column()
  product_thumb: string;

  @Column({type: 'text'})
  product_description: string;

  @Column('json', {nullable: true})
  product_variants: Record<string, any>;

  @Column('json', {nullable: true})
  multimedia_content: Record<string, any>;

  @Column({
    type: 'enum',
    enum: ProductStatusEnum,
    default: ProductStatusEnum.DRAFT,
  })
  status: string;

  @Column({
    default: 0,
  })
  sold_quantity: number;

  //1 product belongs to 1 category
  @ManyToOne(() => CategoryEntity)
  @JoinColumn({name: 'category'})
  category: CategoryEntity;

  @UpdateDateColumn()
  updated_at: Date;

  @CreateDateColumn()
  created_at: Date;
}