import {Prop, SchemaFactory, Schema} from "@nestjs/mongoose";
import {HydratedDocument, Schema as MongooseSchema, Types} from "mongoose";

export type ShopDocument = HydratedDocument<ShopEntity>;

@Schema({
  timestamps: true,
})
export class ShopEntity {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
  })
  user_id: Types.ObjectId;

  @Prop()
  shop_name: string;

  @Prop()
  description: string;

  @Prop()
  address: string;

  @Prop()
  phone_number: string;

  @Prop({
    default: 0,
  })
  rating: number;

  @Prop({
    nullable: true,
  })
  website: string;

  @Prop()
  logo: string;

  @Prop()
  cover_image: string;

  @Prop({
    default: false,
  })
  is_active: boolean;
}

export const ShopSchema = SchemaFactory.createForClass(ShopEntity);