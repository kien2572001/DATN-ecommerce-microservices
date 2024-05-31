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
import { Transform, Type } from 'class-transformer';

export class CartItemDto {
  @IsString()
  @Type(() => String)
  product_id: string;

  @Type(() => Number || String)
  inventory_id: number | string;

  @IsString()
  @Type(() => String)
  shop_id: string;

  @IsNumber()
  @Type(() => Number)
  quantity: number;
}
