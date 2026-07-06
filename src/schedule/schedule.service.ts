import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { SCHEDULE_ITEM_FOUND } from './schedule.constants';
import { ScheduleModel, ScheduleModelDocument } from './schedule.model';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(ScheduleModel.name)
    private readonly scheduleModel: Model<ScheduleModelDocument>,
  ) {}

  async create(dto: CreateScheduleDto) {
    const existItem = await this.scheduleModel.find({
      roomId: dto.roomId,
      date: dto.date,
    });

    if (existItem) {
      throw new HttpException(SCHEDULE_ITEM_FOUND, HttpStatus.CONFLICT);
    }

    const newScheduleItem = new this.scheduleModel(dto);
    await newScheduleItem.save();
  }

  async delete(id: string) {
    await this.scheduleModel
      .findOneAndUpdate(
        { _id: id },
        {
          isDeleted: true,
        },
      )
      .exec();
  }

  async get(id: string) {
    const item = await this.scheduleModel
      .findOne({
        _id: id,
        isDeleted: false,
      })
      .exec();

    if (!item) {
      throw new NotFoundException(`Запись c ${id} не найдена`);
    }

    return item;
  }

  async update(id: string, dto: CreateScheduleDto) {
    return this.scheduleModel
      .findOneAndUpdate(
        {
          _id: id,
          isDeleted: false,
        },
        dto,
      )
      .exec();
  }
}
