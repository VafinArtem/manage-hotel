import { IsEnum, IsString } from 'class-validator';
import { Role } from '../../enums/role.enum';

export class AuthDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsEnum(Role)
  role: Role;
}
