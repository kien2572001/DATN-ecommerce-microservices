import {Type} from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEmail,
  isEnum,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator';

export class UserLoginDto {
  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  email: string;

  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  password: string;
}