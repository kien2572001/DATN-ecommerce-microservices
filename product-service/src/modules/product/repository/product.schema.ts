import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose"
import {HydratedDocument, Types} from 'mongoose';
import {BaseEntity} from "../../../base/base.entity";
import {ProductStatusEnum} from "../../../enums/productStatus.enum";
import {Category} from "../../category/repository/category.schema";
import {Classification} from "./classification.schema";

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
    nullable: true
  })
  product_thumb: string;

  @Prop()
  product_description: string;

  @Prop()
  product_variants: Array<any>;

  @Prop()
  multimedia_content: Array<any>;

  @Prop({
    default: 0,
  })
  sold_quantity: number;

  @Prop({
    default: 'DRAFT',
    enum: ProductStatusEnum,
  })
  status: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Category',
  })
  category: Category;

  @Prop({
    type: [Types.ObjectId],
    ref: 'Classification',
  })
  classifications: Array<Types.ObjectId>
}

export const ProductSchema = SchemaFactory.createForClass(Product);