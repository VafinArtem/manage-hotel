import { IsEmail, IsEnum, IsPhoneNumber, IsString } from 'class-validator';
import { Role } from '../../enums/role.enum';

export class AuthDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  name: string;

  @IsPhoneNumber('RU')
  phone: string;

  @IsEnum(Role)
  role: Role;
}
