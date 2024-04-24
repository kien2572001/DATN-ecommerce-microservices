import {Prop, SchemaFactory, Schema} from "@nestjs/mongoose";
import {HydratedDocument, Schema as MongooseSchema, Types} from "mongoose";


export type UserDocument = HydratedDocument<UserEntity>;

@Schema({
  timestamps: true,
})
export class AddressEntity {
  @Prop()
  customer_name: string;

  @Prop()
  type: string;

  @Prop()
  location: string;

  @Prop({
    default: false,
  })
  is_default: boolean;

  @Prop()
  phone_number: string;
}

@Schema({
  timestamps: true,
})
export class UserEntity {
  @Prop({
    //required: true,
    //unique: true,
    index: true,
  })
  username: string;

  @Prop({
    unique: true,
    index: true,
    required: true,
  })
  email: string;

  @Prop({
    //required: true,
    index: true,
    unique: true,
  })
  phone_number: string;

  @Prop({
    required: true,
  })
  password: string;

  @Prop({
    //required: true,
  })
  display_name: string;

  @Prop({
    nullable: true,
  })
  gender: string;

  @Prop({
    nullable: true,
  })
  birthdate: Date;

  @Prop({
    index: true,
    required: true,
  })
  role: string;

  @Prop({
    default: [],
  })
  address: AddressEntity[];

  @Prop({
    type: MongooseSchema.Types.ObjectId, ref: 'AddressEntity',
    nullable: true,
  })
  default_address_id: Types.ObjectId;

  @Prop({
    nullable: true,
  })
  avatar: string;

  @Prop({
    nullable: true,
  })
  registered_at: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);
export const AddressSchema = SchemaFactory.createForClass(AddressEntity);
