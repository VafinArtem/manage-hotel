import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { ScheduleService } from './schedule.service';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('getAll')
  async getAll() {
    return await this.scheduleService.getAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.scheduleService.get(id);
  }

  @UsePipes(new ValidationPipe())
  @Post('create')
  async create(@Body() dto: CreateScheduleDto) {
    return await this.scheduleService.create(dto);
  }

  @Patch(':id')
  async patch(@Param('id') id: string, @Body() dto: CreateScheduleDto) {
    return await this.scheduleService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.scheduleService.delete(id);
  }
}
