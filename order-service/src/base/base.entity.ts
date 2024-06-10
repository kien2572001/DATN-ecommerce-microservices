import { Prop } from '@nestjs/mongoose';

export class BaseEntity {
  _id?: string;

  @Prop({
    index: true,
  })
  deleted_at: Date;
}
