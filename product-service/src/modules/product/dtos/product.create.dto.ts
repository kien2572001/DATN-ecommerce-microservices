import {IsEnum, IsInt, IsJSON, IsNotEmpty, IsOptional, IsString, MaxLength} from 'class-validator';
import {Type} from 'class-transformer';
import {ProductStatusEnum} from "../../../enums/productStatus.enum";

export class CreateProductDto {
  @IsInt()
  @Type(() => Number)
  category_id: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  product_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  product_description: string;

  files: Express.Multer.File[];

  @IsOptional()
  @IsString()
  @IsEnum(ProductStatusEnum)
  status: string;

  @IsOptional()
  @IsJSON()
  product_variants: Record<string, any>;
}