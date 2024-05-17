import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose"
import {HydratedDocument, Types} from 'mongoose';
import {BaseEntity} from "../../../base/base.entity";

export type ClassificationDocument = HydratedDocument<Classification>;

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})

export class Classification extends BaseEntity {
  @Prop()
  classification_name: string;

  @Prop({
    default: [],
  })
  items: Array<any>;
}

export const ClassificationSchema = SchemaFactory.createForClass(Classification);