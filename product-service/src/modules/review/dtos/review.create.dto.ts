import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsString()
  product_id: string;

  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsOptional()
  @IsString()
  comment: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  rating: number;
}
