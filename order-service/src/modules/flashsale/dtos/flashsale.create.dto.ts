import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FlashSaleItemDto } from './flashsale-item.dto';
import { FlashSaleProductDto } from './flashsale-product.dto';
export class CreateFlashSaleDto {
  @IsString()
  @Type(() => String)
  shop_id: string;

  @IsString()
  @Type(() => String)
  status: string;

  @IsBoolean()
  @Type(() => Boolean)
  is_active: boolean;

  @IsDate()
  @Type(() => Date)
  time_start: Date;

  @IsDate()
  @Type(() => Date)
  time_end: Date;

  @IsArray()
  @Type(() => Array)
  @ValidateNested({ each: true })
  products: Array<FlashSaleProductDto>;
}
