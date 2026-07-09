import { IsBoolean, IsString } from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  date: string;

  @IsString()
  roomId: string;

  @IsBoolean()
  isDeleted: boolean;
}
