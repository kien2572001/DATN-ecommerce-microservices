import {
  Column,
  CreateDateColumn,
  Entity, OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import {OptionEntity} from "./option.entity";

@Entity()
export class ProductVariationEntity {
  @PrimaryGeneratedColumn()
  product_variation_id: number;

  @Column()
  product_id: number;

  @Column()
  variation_title: string;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => OptionEntity, option => option.product_variation)
  options: OptionEntity[];

  @CreateDateColumn()
  created_at: Date;
}