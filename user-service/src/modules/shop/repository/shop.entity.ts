import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Factory } from 'nestjs-seeder';
export type ShopDocument = HydratedDocument<ShopEntity>;

@Schema({
  timestamps: true,
})
export class ShopEntity {
  @Factory((faker) => faker.company.name())
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
  })
  user_id: Types.ObjectId;

  @Factory((faker) => faker.company.name())
  @Prop()
  shop_name: string;

  @Factory((faker) => faker.lorem.paragraph())
  @Prop()
  description: string;

  @Factory((faker) => faker.location.streetAddress())
  @Prop()
  address: string;

  @Factory((faker) => faker.phone.number())
  @Prop()
  phone_number: string;

  @Prop({
    default: 0,
  })
  rating: number;

  @Factory((faker) => faker.internet.url())
  @Prop({
    nullable: true,
  })
  website: string;

  @Factory((faker) =>
    faker.image.url({
      width: 300,
      height: 300,
    }),
  )
  @Prop()
  logo: string;

  @Factory((faker) =>
    faker.image.url({
      width: 1000,
      height: 300,
    }),
  )
  @Prop()
  cover_image: string;

  @Prop({
    default: false,
    index: true,
  })
  is_active: boolean;
}

export const ShopSchema = SchemaFactory.createForClass(ShopEntity);
