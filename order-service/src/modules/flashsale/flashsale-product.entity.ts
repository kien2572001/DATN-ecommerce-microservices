import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseEntity } from '../../base/base.entity';
import * as paginate from 'mongoose-paginate-v2';

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class FlashSaleProduct extends BaseEntity {
  @Prop({
    required: true,
    index: true,
  })
  flash_sale_id: string;

  @Prop({
    required: true,
    index: true,
  })
  is_active: boolean;

  @Prop({
    required: true,
    index: true,
  })
  product_id: string;

  @Prop({
    required: true,
    type: Date,
    index: true,
  })
  time_start: Date;

  @Prop({
    required: true,
    type: Date,
    index: true,
  })
  time_end: Date;

  @Prop({
    type: Array,
    default: [],
  })
  items: Array<{
    inventory_id: string;
    price: number;
    flash_sale_price: number;
    flash_sale_quantity: number;
    flash_sale_percentage: number;
  }>;
}

export type FlashSaleProductDocument = HydratedDocument<FlashSaleProduct>;
export const FlashSaleProductSchema =
  SchemaFactory.createForClass(FlashSaleProduct).plugin(paginate);
FlashSaleProductSchema.plugin(paginate);
