import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get('getAll')
  async getAll() {
    return await this.roomsService.getAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const room = await this.roomsService.get(id);

    if (!room) {
      throw new NotFoundException(`Комната c ${id} не найдена`);
    }

    return room;
  }

  @UsePipes(new ValidationPipe())
  @Post('create')
  async create(@Body() dto: CreateRoomDto) {
    return await this.roomsService.create(dto);
  }

  @Patch(':id')
  async patch(@Param('id') id: string, @Body() dto: CreateRoomDto) {
    return await this.roomsService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deletedDoc = await this.roomsService.delete(id);

    if (!deletedDoc) {
      throw new NotFoundException(`Комната c ${id} не найдена`);
    }
  }
}
