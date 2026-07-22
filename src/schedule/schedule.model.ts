import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MSchema, Types } from 'mongoose';
import { RoomsModel } from '../rooms/rooms.model';

export type ScheduleModelDocument = HydratedDocument<ScheduleModel>;

@Schema({ timestamps: true })
export class ScheduleModel {
  @Prop()
  date: string;

  @Prop({ type: MSchema.Types.ObjectId, ref: RoomsModel.name })
  roomId: Types.ObjectId;

  @Prop()
  isDeleted: boolean;
}

export const ScheduleModelSchema = SchemaFactory.createForClass(ScheduleModel);
ScheduleModelSchema.index({ date: 1, isDeleted: 1 });
