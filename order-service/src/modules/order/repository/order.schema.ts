import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseEntity } from '../../../base/base.entity';
import * as paginate from 'mongoose-paginate-v2';
export type OrderDocument = HydratedDocument<Order>;

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Order extends BaseEntity {
  @Prop({
    index: true,
  })
  order_id: string;

  @Prop({
    index: true,
  })
  code: string;

  @Prop({
    index: true,
  })
  user_id: string;

  @Prop({
    index: true,
  })
  status: string;

  @Prop({
    type: Object,
  })
  shipping_address: object;

  @Prop({
    type: Number,
  })
  shipping_fee: number;

  @Prop({
    type: String,
  })
  payment_method: string;

  @Prop({
    type: Object,
    default: {},
  })
  payment_info: object;

  @Prop()
  total: number;

  @Prop()
  order_items: Array<any>;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.plugin(paginate);
