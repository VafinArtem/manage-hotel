import { IsString } from 'class-validator';

export class StatisticDto {
  @IsString()
  date: string;
}
