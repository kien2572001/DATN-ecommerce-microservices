import {
  Column,
  CreateDateColumn, DeepPartial,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import {ProductVariationEntity} from "./product-variation.entity";

@Entity()
export class OptionEntity {
  @PrimaryGeneratedColumn()
  option_id: number;

  @Column()
  option_title: string;

  @Column()
  @ManyToOne(() => ProductVariationEntity, productVariation => productVariation.options)
  @JoinColumn({name: 'product_variation_id'})
  product_variation: number;

  @Column('json', {nullable: true})
  images: Record<string, any>;

  @UpdateDateColumn()
  updated_at: Date;

  @CreateDateColumn()
  created_at: Date;
}