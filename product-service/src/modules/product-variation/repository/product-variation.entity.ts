import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne, OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import {OptionEntity} from "./option.entity";
import {VariationEntity} from "./variation.entity";

@Entity()
export class ProductVariationEntity {
  @PrimaryGeneratedColumn()
  product_variation_id: number;

  @Column()
  product_id: number;
  
  @ManyToOne(() => VariationEntity, variation => variation.variation_id)
  @JoinColumn({name: 'variation_id'})
  variation: VariationEntity;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => OptionEntity, option => option.product_variation_id)
  options: OptionEntity[];

  @CreateDateColumn()
  created_at: Date;
}