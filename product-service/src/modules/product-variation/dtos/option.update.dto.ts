import {IsInt, IsNotEmpty, IsOptional, IsString, MaxLength} from 'class-validator';
import {Type} from 'class-transformer';

export class UpdateOptionDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  option_id: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  option_title: string;

  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  product_variation_id: number;
}