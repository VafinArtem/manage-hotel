import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { StatisticDto } from './dto/statistic.dto';
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin)
  @UsePipes(new ValidationPipe())
  @Post('create')
  async create(@Body() dto: CreateScheduleDto) {
    return await this.scheduleService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin)
  @UsePipes(new ValidationPipe())
  @Patch(':id')
  async patch(@Param('id') id: string, @Body() dto: CreateScheduleDto) {
    return await this.scheduleService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.scheduleService.delete(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post('statistic/byMonth')
  async getStatisticByMonth(@Body() dto: StatisticDto) {
    return await this.scheduleService.getStatisticByMonth(dto);
  }
}
