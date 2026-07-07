import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomsController } from './rooms.controller';
import { RoomsModel, RoomsModelSchema } from './rooms.model';
import { RoomsService } from './rooms.service';

@Module({
  controllers: [RoomsController],
  providers: [RoomsService],
  imports: [
    MongooseModule.forFeature([
      {
        name: RoomsModel.name,
        schema: RoomsModelSchema,
      },
    ]),
  ],
})
export class RoomsModule {}
