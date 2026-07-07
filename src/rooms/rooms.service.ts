import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
    await newRoom.save();
  }

  async delete(id: string) {
    return this.roomsModel.findByIdAndDelete(id).exec();
  }

  async get(id: string) {
    return this.roomsModel.findById(id).exec();
  }

  async getAll() {
    return this.roomsModel.find({});
  }

  async update(id: string, dto: CreateRoomDto) {
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
