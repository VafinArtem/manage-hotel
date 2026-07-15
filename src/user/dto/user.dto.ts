import { IsEnum, IsString } from 'class-validator';
import { Role } from '../../enums/role.enum';

export class UserDto {
  @IsString()
  email: string;

  @IsString()
  passwordHash: string;

  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsEnum(Role)
  role: Role;
}
