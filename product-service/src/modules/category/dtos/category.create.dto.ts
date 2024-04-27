import {IsInt, IsNotEmpty, IsOptional, IsString, MaxLength} from 'class-validator';
import {Type} from 'class-transformer';

export class CreateCategoryDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  parent_id: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  category_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  category_thumb: string;
}
