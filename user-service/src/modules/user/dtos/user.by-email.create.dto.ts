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
import {GendersEnum} from "../../../enums/genders.enum";
import {RolesEnum} from "../../../enums/roles.enum";

export class UserCreateByEmailDto {
  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  username: string;

  @IsEmail()
  @IsNotEmpty()
  @Type(() => String)
  email: string;

  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(RolesEnum)
  role: string;
}