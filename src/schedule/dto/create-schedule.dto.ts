import { IsBoolean, IsMongoId, IsString } from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  date: string;

  @IsMongoId()
  roomId: string;

  @IsBoolean()
  isDeleted: boolean;
}
