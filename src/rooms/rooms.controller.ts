import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post('create')
  async create(@Body() dto: CreateRoomDto) {
    await this.roomsService.create(dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deletedDoc = await this.roomsService.delete(id);

    if (!deletedDoc) {
      throw new NotFoundException(`Комната c ${id} не найдена`);
    }
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.roomsService.get(id);
  }

  @Patch(':id')
  async patch(@Param('id') id: string, @Body() dto: CreateRoomDto) {
    return await this.roomsService.update(id, dto);
  }
}
