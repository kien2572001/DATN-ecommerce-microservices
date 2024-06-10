import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseEntity } from '../../base/base.entity';
import * as paginate from 'mongoose-paginate-v2';

export type FlashSaleDocument = HydratedDocument<FlashSale>;

// Định nghĩa lớp FlashSaleItem
class FlashSaleItem {
  @Prop({ required: true })
  product_id: string;

  @Prop({ required: true })
  inventory_id: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  flash_sale_price: number;

  @Prop({ required: true })
  flash_sale_quantity: number;

  @Prop({ required: true })
  flash_sale_percentage: number;
}

// Định nghĩa lớp FlashSaleProduct
class FlashSaleProduct {
  @Prop({ required: true })
  _id: string;

  @Prop({ type: [FlashSaleItem], required: true })
  items: FlashSaleItem[];
}

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class FlashSale extends BaseEntity {
  @Prop({ index: true, required: true })
  shop_id: string;

  @Prop({ index: true, required: true })
  status: string;

  @Prop({ index: true, required: true })
  is_active: boolean;

  @Prop({ index: true, required: true })
  time_start: Date;

  @Prop({ index: true, required: true })
  time_end: Date;

  @Prop({ type: [FlashSaleProduct], default: [] })
  products: FlashSaleProduct[];
}

export const FlashSaleSchema = SchemaFactory.createForClass(FlashSale);
FlashSaleSchema.plugin(paginate);
