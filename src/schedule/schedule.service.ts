import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IdValidationPipe } from '../pipes/id-validation.pipe';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { StatisticDto } from './dto/statistic.dto';
import { SCHEDULE_ITEM_FOUND } from './schedule.constants';
import { ScheduleModel, ScheduleModelDocument } from './schedule.model';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(ScheduleModel.name)
    private readonly scheduleModel: Model<ScheduleModelDocument>,
  ) {}

  async create(dto: CreateScheduleDto) {
    const exists = await this.scheduleModel.exists({
      roomId: dto.roomId,
      date: dto.date,
    });

    if (exists) {
      throw new HttpException(SCHEDULE_ITEM_FOUND, HttpStatus.CONFLICT);
    }

    const newScheduleItem = new this.scheduleModel({
      ...dto,
      roomId: new Types.ObjectId(dto.roomId),
    });
    return await newScheduleItem.save();
  }

  async delete(@Param('id', IdValidationPipe) id: string) {
    await this.scheduleModel
      .findOneAndUpdate(
        { _id: id },
        {
          isDeleted: true,
        },
      )
      .exec();
  }

  async getAll() {
    return this.scheduleModel.find({ isDeleted: false });
  }

  async get(@Param('id', IdValidationPipe) id: string) {
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

  async update(
    @Param('id', IdValidationPipe) id: string,
    dto: CreateScheduleDto,
  ) {
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

  async getStatisticByMonth(dto: StatisticDto) {
    const data: { roomNumber: number; daysCount: number }[] =
      (await this.scheduleModel
        .aggregate()
        .match({
          date: { $regex: `^${dto.date}`, $options: 'i' },
          isDeleted: false,
        })
        .lookup({
          from: 'roomsmodels',
          localField: 'roomId',
          foreignField: '_id',
          as: 'rooms',
        })
        .unwind('$rooms')
        .group({
          _id: '$rooms.roomNumber',
          daysCount: { $sum: 1 },
        })
        .sort({ _id: 1 })
        .project({
          _id: 0,
          roomNumber: '$_id',
          daysCount: 1,
        })
        .exec()) as { roomNumber: number; daysCount: number }[];

    if (data.length === 0) {
      return 'Статистики по номерам за этот период нет';
    }

    return data
      .map((item) => `Номер ${item.roomNumber} | ${item.daysCount}`)
      .join('\n');
  }
}
