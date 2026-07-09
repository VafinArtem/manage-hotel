import { IsBoolean, IsNumber, IsEnum } from 'class-validator';
import { RoomType } from '../rooms.model';

export class CreateRoomDto {
  @IsNumber()
  roomNumber: number;

  @IsEnum(RoomType)
  roomType: RoomType;

  @IsBoolean()
  seaView: boolean;
}
