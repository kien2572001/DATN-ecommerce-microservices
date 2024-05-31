import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseEntity } from '../../../base/base.entity';
import * as paginate from 'mongoose-paginate-v2';
export type ReviewDocument = HydratedDocument<Review>;

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Review extends BaseEntity {
  @Prop({
    index: true,
  })
  product_id: string;

  @Prop({
    index: true,
  })
  user_id: string;

  @Prop()
  rating: number;

  @Prop({
    default: [],
  })
  images: any[];

  @Prop({
    default: [],
  })
  videos: any[];

  @Prop()
  comment: string;

  @Prop({
    default: [],
  })
  reactions: string[];
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
ReviewSchema.plugin(paginate);
