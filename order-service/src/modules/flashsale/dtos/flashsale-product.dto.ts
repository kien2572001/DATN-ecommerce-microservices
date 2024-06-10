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

export class FlashSaleProductDto {
  @IsString()
  @Type(() => String)
  _id: string;

  @IsArray()
  @Type(() => Array)
  items: Array<FlashSaleItemDto>;
}
