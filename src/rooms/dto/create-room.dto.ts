import { RoomType } from '../rooms.model';

export class CreateRoomDto {
  roomNumber: number;
  roomType: RoomType;
  seaView: boolean;
}
