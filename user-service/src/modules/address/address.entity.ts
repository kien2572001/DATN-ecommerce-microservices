import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Factory } from 'nestjs-seeder';

export type AddressDocument = HydratedDocument<AddressEntity>;

@Schema({
  timestamps: true,
})
export class AddressEntity {
  @Prop({
    required: true,
    index: true,
  })
  id: string;

  @Prop({
    required: true,
    index: true,
  })
  type: string;

  @Prop({
    required: true,
  })
  name: string;

  @Prop({
    nullable: true,
    index: true,
  })
  city_id: string;

  @Prop({
    nullable: true,
    index: true,
  })
  district_id: string;
}

export const AddressSchema = SchemaFactory.createForClass(AddressEntity);
