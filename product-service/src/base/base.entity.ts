import {Prop} from '@nestjs/mongoose';

export class BaseEntity {
  _id?: string;

  @Prop({
    index: true,
    default: null,
  })
  deleted_at: Date;
}