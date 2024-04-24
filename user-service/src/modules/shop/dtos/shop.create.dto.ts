import {Type} from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEmail,
  isEnum,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator';

export class ShopCreateDto {
  @IsString()
  @IsNotEmpty()
  shop_name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @IsString()
  @IsOptional()
  website: string;

  @IsString()
  @IsNotEmpty()
  logo: string;

  @IsString()
  @IsNotEmpty()
  cover_image: string;
}