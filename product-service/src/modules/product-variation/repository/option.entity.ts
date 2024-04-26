import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";

@Entity()
export class OptionEntity {
  @PrimaryGeneratedColumn()
  option_id: number;

  @Column()
  option_title: string;

  @Column()
  product_variation_id: number;

  @UpdateDateColumn()
  updated_at: Date;

  @CreateDateColumn()
  created_at: Date;
}