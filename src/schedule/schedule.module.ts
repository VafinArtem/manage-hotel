import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomsModel, RoomsModelSchema } from '../rooms/rooms.model';
import { ScheduleController } from './schedule.controller';
import { ScheduleModel, ScheduleModelSchema } from './schedule.model';
import { ScheduleService } from './schedule.service';

@Module({
  controllers: [ScheduleController],
  imports: [
    MongooseModule.forFeature([
      {
        name: RoomsModel.name,
        schema: RoomsModelSchema,
      },
      {
        name: ScheduleModel.name,
        schema: ScheduleModelSchema,
      },
    ]),
  ],
  providers: [ScheduleService],
})
export class ScheduleModule {}
