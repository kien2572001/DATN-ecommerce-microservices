import {
  IsArray,
  IsEnum,
  IsInt,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './order-item.create.dto';

export class CreateOrderDto {
  @IsString()
  @Type(() => String)
  code: string;

  @IsString()
  @Type(() => String)
  user_id: string;

  @IsString()
  @Type(() => String)
  shop_id: string;

  @IsNumber()
  @Type(() => Number)
  shipping_fee: number;

  @IsString()
  @Type(() => String)
  payment_method: string;

  @IsObject()
  @Type(() => Object)
  shipping_address: object;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  order_items: CreateOrderItemDto[];
}
