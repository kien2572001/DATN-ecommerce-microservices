import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BaseEntity } from '../../../base/base.entity';
import { ProductStatusEnum } from '../../../enums/productStatus.enum';
import { Category } from '../../category/repository/category.schema';
import * as paginate from 'mongoose-paginate-v2';

export type ProductDocument = HydratedDocument<Product>;

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Product extends BaseEntity {
  @Prop({
    index: true,
  })
  shop_id: string;

  @Prop()
  product_name: string;

  @Prop({
    index: true,
  })
  product_slug: string;

  @Prop({
    nullable: true,
  })
  product_thumb: string;

  @Prop()
  product_description: string;

  @Prop()
  product_variants: Array<any>;

  @Prop({
    default: [],
  })
  images: Array<any>;

  @Prop({
    default: [],
  })
  videos: Array<any>;

  @Prop({
    default: 0,
  })
  price: number;

  @Prop({
    default: 'DRAFT',
    enum: ProductStatusEnum,
    index: true,
  })
  status: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Category',
    index: true,
  })
  category: Category;

  @Prop({
    type: Boolean,
    default: false,
  })
  is_has_many_classifications: boolean;
  @Prop({
    nullable: true,
  })
  inventory_id: number;

  @Prop({
    default: [],
  })
  classifications: Array<any>;

  @Prop({
    type: Object,
  })
  shipping_information: object;

  @Prop({
    default: 0,
  })
  sold_quantity: number;

  @Prop({
    default: 0,
  })
  rating: number;

  @Prop({
    default: 0,
  })
  total_reviews: number;

  @Prop({
    default: 0,
  })
  total_views: number;

  @Prop({
    default: 0,
    index: true,
  })
  trending_score: number;

  @Prop({
    default: 0,
    index: true,
  })
  popular_score: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.plugin(paginate);
