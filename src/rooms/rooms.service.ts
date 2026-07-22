import { Injectable, Param } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IdValidationPipe } from '../pipes/id-validation.pipe';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomsModel, RoomsModelDocument } from './rooms.model';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(RoomsModel.name)
    private readonly roomsModel: Model<RoomsModelDocument>,
  ) {}

  async create(dto: CreateRoomDto) {
    const newRoom = new this.roomsModel(dto);
    return await newRoom.save();
  }

  async delete(@Param('id', IdValidationPipe) id: string) {
    return this.roomsModel.findByIdAndDelete(id).exec();
  }

  async get(@Param('id', IdValidationPipe) id: string) {
    return this.roomsModel.findById(id).exec();
  }

  async getAll() {
    return this.roomsModel.find({});
  }

  async update(@Param('id', IdValidationPipe) id: string, dto: CreateRoomDto) {
    return this.roomsModel
      .updateOne(
        {
          _id: id,
        },
        dto,
      )
      .exec();
  }
}
