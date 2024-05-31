import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Factory } from 'nestjs-seeder';
import { RolesEnum } from 'src/enums/roles.enum';

export type UserDocument = HydratedDocument<UserEntity>;

@Schema({
  timestamps: true,
})
@Schema({
  timestamps: true,
})
export class UserEntity {
  @Factory((faker) => faker.internet.userName())
  @Prop({
    //required: true,
    //unique: true,
    index: true,
  })
  username: string;

  @Factory((faker) => faker.internet.email())
  @Prop({
    unique: true,
    index: true,
    required: true,
  })
  email: string;

  @Factory((faker) => faker.phone.number())
  @Prop({
    //required: true,
    index: true,
    unique: true,
  })
  phone_number: string;

  @Factory('$2b$10$hIPrwi8ItujKhULFuJOeiuekKzgyuSIhQZDcUpAhoYFqr1fsS3qR2')
  @Prop({
    required: true,
  })
  password: string;

  @Factory((faker) => faker.internet.displayName())
  @Prop({
    //required: true,
  })
  display_name: string;

  @Factory((faker) => faker.person.gender())
  @Prop({
    nullable: true,
  })
  gender: string;

  @Factory((faker) => faker.date.past())
  @Prop({
    nullable: true,
  })
  birthdate: Date;

  @Factory((faker) =>
    faker.helpers.arrayElement([
      RolesEnum.ADMIN,
      RolesEnum.BUYER,
      RolesEnum.SELLER,
    ]),
  )
  @Prop({
    index: true,
    required: true,
  })
  role: string;

  @Prop({
    default: [],
  })
  address: any[];

  @Factory((faker) => faker.image.avatar())
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
