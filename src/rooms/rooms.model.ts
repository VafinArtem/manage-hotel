import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RoomsModelDocument = HydratedDocument<RoomsModel>;

export enum RoomType {
  STANDARD,
  LUXE,
  ECONOMY,
}

@Schema({ timestamps: true })
export class RoomsModel {
  @Prop()
  roomNumber: number;

  @Prop({ enum: RoomType })
  roomType: RoomType;

  @Prop()
  seaView: boolean;
}

export const RoomsModelSchema = SchemaFactory.createForClass(RoomsModel);
