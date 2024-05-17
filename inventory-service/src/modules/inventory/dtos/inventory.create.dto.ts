import {
  IsArray,
  IsEnum,
  IsInt,
  IsJSON,
  IsNotEmpty, IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested
} from 'class-validator';
import {Type} from 'class-transformer';

export class CreateInventoryDto {
  @IsString()
  @Type(() => String)
  product_id: string;

  @IsString()
  @Type(() => String)
  classification_main_id: string;

  @IsString()
  @Type(() => String)
  classification_sub_id: string;

  @IsOptional()
  @IsJSON()
  thumbnail: Record<string, any>;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  discount: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  discount_price: number;
}