import {
  IsArray,
  IsEnum,
  IsInt,
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested
} from 'class-validator';
import {Type} from 'class-transformer';
import {ProductStatusEnum} from "../../../enums/productStatus.enum";
import {CreateClassificationDto} from "./classification.create.dto";
import {CreateInventoryDto} from "../../inventory/dtos/inventory.create.dto";

export class CreateProductDto {
  @IsString()
  @Type(() => String)
  category_id: string;

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
  product_variants: any;

  @IsOptional()
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => CreateClassificationDto)
  classifications: CreateClassificationDto[];

  @IsOptional()
  @IsArray()
  @IsString({each: true})
  @Type(() => String)
  inventories: CreateInventoryDto[];
}