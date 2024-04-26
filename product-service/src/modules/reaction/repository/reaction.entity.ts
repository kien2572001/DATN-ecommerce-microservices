import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

@Entity()
export class ReactionEntity {
  @PrimaryGeneratedColumn()
  reaction_id: number;

  @Column()
  user_id: string;

  @Column()
  review_id: number;

  @UpdateDateColumn()
  updated_at: Date;

  @CreateDateColumn()
  created_at: Date;
}