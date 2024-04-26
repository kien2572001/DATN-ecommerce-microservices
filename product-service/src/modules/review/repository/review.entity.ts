import {Module} from "@nestjs/common";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne, OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import {ProductEntity} from "../../product/repository/product.entity";
import {ReactionEntity} from "../../reaction/repository/reaction.entity";

@Entity()
export class ReviewEntity {
  @PrimaryGeneratedColumn()
  review_id: number;

  @Column()
  @ManyToOne(() => ProductEntity)
  product_id: number;

  @Column()
  user_id: number;

  @Column()
  rating: number;

  @Column('json', {nullable: true})
  images: Record<string, any>;

  @Column('json', {nullable: true})
  videos: Record<string, any>;

  @Column({type: 'text', nullable: true})
  content: string;

  @OneToMany(() => ReactionEntity, reaction => reaction.review_id)
  reactions: ReactionEntity[];

  @UpdateDateColumn()
  updated_at: Date;

  @CreateDateColumn()
  created_at: Date;
}