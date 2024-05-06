import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import {ProductVariationEntity} from "../../product-variation/repository/product-variation.entity";
import {OptionEntity} from "../../product-variation/repository/option.entity";

@Entity()
export class InventoryEntity {
  @PrimaryGeneratedColumn()
  inventory_id: number;

  @Column()
  product_id: number;

  @ManyToOne(() => ProductVariationEntity)
  @JoinColumn({name: 'product_variation_id'})
  product_variation: ProductVariationEntity;

  @ManyToOne(() => OptionEntity)
  @JoinColumn({name: 'option_id'})
  option: OptionEntity;
  
  @UpdateDateColumn()
  updated_at: Date;

  @CreateDateColumn()
  created_at: Date;
}