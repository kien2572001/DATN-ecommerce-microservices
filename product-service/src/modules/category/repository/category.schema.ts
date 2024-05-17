import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose"
import {HydratedDocument} from 'mongoose';
import {BaseEntity} from "../../../base/base.entity";

export type CategoryDocument = HydratedDocument<Category>;

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Category extends BaseEntity {
  @Prop({
    index: true,
  })
  shop_id: string;

  @Prop()
  category_name: string;

  @Prop({
    index: true,
  })
  category_slug: string;

  @Prop({
    nullable: true,
    index: true,
  })
  path: string;

  @Prop({
    nullable: true,
  })
  level: number;

  @Prop({
    nullable: true,
  })
  category_thumb: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

