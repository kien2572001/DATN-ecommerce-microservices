import {IsInt, IsNotEmpty, IsOptional, IsString, MaxLength} from 'class-validator';
import {Type} from 'class-transformer';
import {UpdateOptionDto} from "./option.update.dto";

export class UpdateProductVariationDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  product_variation_id: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  variation_title: string;

  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  product_id: number;

  @IsOptional()
  @Type(() => UpdateOptionDto)
  options: UpdateOptionDto[];
}