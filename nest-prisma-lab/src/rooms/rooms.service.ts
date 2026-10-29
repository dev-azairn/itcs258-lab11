import { BadRequestException, Injectable, Module, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';


@Injectable()
export class RoomsService {

  private readonly logger = new Logger('RoomsService');

  constructor(private readonly prisma: PrismaService) {};

  async create(dto: CreateRoomDto) {
      this.logger.log(`Executing create()...`)
      try {
        const room = await this.prisma.rooms.create({
          data: {
            ...dto,
            is_active: dto.is_active ?? true,
          },
        })
        this.logger.log(`Creating room: ${room.name}`)
        return room;
      } catch (e: any) {
        this.logger.error(`Creating Failed`)
        throw e;
      }
  }

  findAll() {
    this.logger.log(`Fetching all rooms`)
    return this.prisma.rooms.findMany();
  }

  async findOne(id: number) {
    this.logger.log(`Fetching room id=${id}`)
    const room = await this.prisma.rooms.findUnique({
      where: 
        { id: id }
    });
    if (!room) {
      this.logger.warn(`Room ${id} not found`)
      throw new NotFoundException(`Room ${id} not found`);
    }
    return room;
  }
  
  async update(id: number, dto: UpdateRoomDto) {
    this.logger.log(`Update room id=${id}`);
    await this.findOne(id);
    return this.prisma.rooms.update({
      where: { id: id },
      data: { ...dto }
    }).catch((e: any) => {
      this.logger.error(`Unable to disable the room`)
    })
  }
  async disable(id: number) {
    this.logger.log(`Disabling room id=${id}`)
    await this.findOne(id);
    return this.prisma.rooms.update({
      where: { id: id },
      data: { is_active: false }
    }).catch((e: any) => {
      this.logger.error(`Unable to disable the room`)
    })
  }

  async enable(id: number) {
    this.logger.log(`Enabling room id=${id}`)
    await this.findOne(id);
    return this.prisma.rooms.update({
      where: { id: id },
      data: { is_active: true }
    }).catch((e: any) => {
      this.logger.error(`Unable to enable the room`)
    })
  }

  async delete(id: number) {
    this.logger.log(`Enabling room id=${id}`)
    await this.findOne(id);
    return this.prisma.rooms.delete({
      where: {id: id}
    })
  }
}

