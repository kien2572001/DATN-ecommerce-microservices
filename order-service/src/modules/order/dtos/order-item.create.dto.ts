import {
  IsArray,
  IsEnum,
  IsInt,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsNull } from 'typeorm';

export class CreateOrderItemDto {
  @IsString()
  @Type(() => String)
  inventory_id: string;

  @IsString()
  @Type(() => String)
  product_id: string;

  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  discount_price: number;
}
