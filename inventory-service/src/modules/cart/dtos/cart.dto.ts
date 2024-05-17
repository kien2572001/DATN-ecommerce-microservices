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
import {CartItemDto} from './cart-item.dto';

export class CartDto {
  @IsString()
  id: string;

  @IsArray()
  @ValidateNested({each: true})
  items: CartItemDto[];
}