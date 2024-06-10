import {
  IsArray,
  IsBoolean,
  IsDate,
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

export class FlashSaleItemDto {
  @IsString()
  @Type(() => String)
  product_id: string;

  @IsString()
  @Type(() => String)
  inventory_id: string;

  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsNumber()
  @Type(() => Number)
  flash_sale_price: number;

  @IsNumber()
  @Type(() => Number)
  flash_sale_quantity: number;

  @IsNumber()
  @Type(() => Number)
  flash_sale_percentage: number;
}
