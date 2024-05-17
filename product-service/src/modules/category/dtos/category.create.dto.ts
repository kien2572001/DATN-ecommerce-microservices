import {IsInt, IsNotEmpty, IsOptional, IsString, MaxLength} from 'class-validator';
import {Type} from 'class-transformer';

export class CreateCategoryDto {
  @IsOptional()
  @IsString()
  @Type(() => String)
  parent_id: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  category_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  category_thumb: string;
}
