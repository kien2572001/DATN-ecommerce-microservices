import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";


@Entity()
//Materialized Path Model
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  category_id: number;

  @Column({
    nullable: true,
  })
  shop_id: number;

  @Column()
  category_name: string;

  @Column()
  category_slug: string;

  @Column()
  path: string;

  @Column()
  level: number;

  @Column({
    nullable: true,
  })
  category_thumb: string;

  @UpdateDateColumn()
  updated_at: Date;

  @CreateDateColumn()
  created_at: Date;
}