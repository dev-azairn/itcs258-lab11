import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Put, UseInterceptors, NotFoundException, Inject } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { user_role } from '../../generated/prisma/enums';
import { JwtAuthGuard } from '../auth/guard/auth.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@UseInterceptors(CacheInterceptor)
@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    @Inject('CACHE_MANAGER')
    private readonly cacheManager: { del: (key: string) => Promise<void> },
  ) {}

  @ApiOperation({
    summary: 'Get all rooms',
    description: 'This endpoint retrieve all rooms in the system.'
  })
  @ApiResponse({ status: 200, description: 'Get all rooms successfully', 
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 42 },
          name: { type: 'string', example: 'Deluxe Room' },
          description: {
            type: 'string',
            nullable: true,
            example: 'The biggest room available for up to 4 people.',
          },
          capacity: { type: 'integer', example: 3 },
          price_per_night: { type: 'number', example: 18.00 },
          image_url: {
            type: 'string',
            nullable: true,
            example: 'http://localhost:8080/example/image.jpg',
          },
          is_active: { type: 'boolean', nullable: true, example: true },
          created_at: { type: 'string', format: 'date-time', nullable: true },
          updated_at: { type: 'string', format: 'date-time', nullable: true },
        }
      }      
    }
  }) 
    @ApiResponse({ status: 401, description: 'Unauthorized'})
    @ApiResponse({ status: 429, description: 'Too Many Requests' })
  @Throttle({default: {limit: 10, ttl: 60000}})
  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  @ApiOperation({
    summary: 'Get a specific room with room\'s ID',
    description: 'This endpoint retrieve a specific room in the system.'
  })
  @ApiResponse({ status: 200, description: 'Get a room successfully', 
    schema: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 42 },
        name: { type: 'string', example: 'Deluxe Room' },
        description: {
          type: 'string',
          nullable: true,
          example: 'The biggest room available for up to 4 people.',
        },
        capacity: { type: 'integer', example: 3 },
        price_per_night: { type: 'number', example: 18.00 },
        image_url: {
          type: 'string',
          nullable: true,
          example: 'http://localhost:8080/example/image.jpg',
        },
        is_active: { type: 'boolean', nullable: true, example: true },
        created_at: { type: 'string', format: 'date-time', nullable: true },
        updated_at: { type: 'string', format: 'date-time', nullable: true },
      }
    } 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The unique identifier of the room',
    example: 42
  })
  @Throttle({default: {limit: 10, ttl: 60000}})
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const room = await this.roomsService.findOne(+id);
    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    return room;
  }

  @UseGuards(RolesGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create a new room',
    description: 'This endpoint create a new room into the system.'
  })
  @Roles(user_role.ADMIN)
  @Throttle({default: {limit: 10, ttl: 60000}})
  @Post()
  create(@Body() dto: CreateRoomDto) {
    return this.roomsService.create(dto);
  }

  @ApiOperation({
    summary: 'Update a specific room',
    description: 'This endpoint updates a room information.'
  })
  
  
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The unique identifier of the room',
    example: 42
  })
  @UseGuards(RolesGuard)
  @Roles(user_role.ADMIN)
  @Throttle({default: {limit: 10, ttl: 60000}})
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoomDto) {
    try {
      return await this.roomsService.update(id, dto);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Room with ID ${id} not found`);
      }
      throw error;
    }
  }
  @ApiOperation({
    summary: 'Set a specific room to be disable for booking.',
    description: 'This endpoint patchs a room to be disable (not active) for booking.'
  })
  @ApiResponse({ status: 200, description: 'Room disabled successfully', 
    schema: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 42 },
        name: { type: 'string', example: 'Deluxe Room' },
        description: {
          type: 'string',
          nullable: true,
          example: 'The biggest room available for up to 4 people.',
        },
        capacity: { type: 'integer', example: 3 },
        price_per_night: { type: 'number', example: 18.00 },
        image_url: {
          type: 'string',
          nullable: true,
          example: 'http://localhost:8080/example/image.jpg',
        },
        is_active: { type: 'boolean', nullable: true, example: true },
        created_at: { type: 'string', format: 'date-time', nullable: true },
        updated_at: { type: 'string', format: 'date-time', nullable: true },
      }
    } 
  })
  @ApiResponse({ status: 400, description: 'Invalid room ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The unique identifier of the room',
    example: 42
  })
  @UseGuards(RolesGuard)
  @Roles(user_role.ADMIN)
  @Throttle({default: {limit: 10, ttl: 60000}})
  @Patch(':id/disable')
  async disable(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.roomsService.disable(id);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Room with ID ${id} not found`);
      }
      throw error;
    }
  }

  @ApiOperation({
    summary: 'Set a specific room to be available for booking.',
    description: 'This endpoint patchs a room to be active for booking.'
  })
  @ApiResponse({ status: 200, description: 'Room enabled successfully', 
    schema: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 42 },
        name: { type: 'string', example: 'Deluxe Room' },
        description: {
          type: 'string',
          nullable: true,
          example: 'The biggest room available for up to 4 people.',
        },
        capacity: { type: 'integer', example: 3 },
        price_per_night: { type: 'number', example: 18.00 },
        image_url: {
          type: 'string',
          nullable: true,
          example: 'http://localhost:8080/example/image.jpg',
        },
        is_active: { type: 'boolean', nullable: true, example: true },
        created_at: { type: 'string', format: 'date-time', nullable: true },
        updated_at: { type: 'string', format: 'date-time', nullable: true },
      } 
    }   
  })
  @ApiResponse({ status: 400, description: 'Invalid room ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The unique identifier of the room',
    example: 42
  })
  @UseGuards(RolesGuard)
  @Roles(user_role.ADMIN)
  @Throttle({default: {limit: 10, ttl: 60000}})
  @Patch(':id/enable')
  async enable(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.roomsService.enable(id);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Room with ID ${id} not found`);
      }
      throw error;
    }
  }

  @ApiOperation({
    summary: 'Delete a room',
    description: 'This endpoint deletes a room in the system.'
  })
  @ApiResponse({ status: 200, description: 'Room enabled successfully', 
    schema: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 42 },
        name: { type: 'string', example: 'Deluxe Room' },
        description: {
          type: 'string',
          nullable: true,
          example: 'The biggest room available for up to 4 people.',
        },
        capacity: { type: 'integer', example: 3 },
        price_per_night: { type: 'number', example: 18.00 },
        image_url: {
          type: 'string',
          nullable: true,
          example: 'http://localhost:8080/example/image.jpg',
        },
        is_active: { type: 'boolean', nullable: true, example: true },
        created_at: { type: 'string', format: 'date-time', nullable: true },
        updated_at: { type: 'string', format: 'date-time', nullable: true },
      } 
    }   
  })
  @ApiResponse({ status: 400, description: 'Invalid room ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The unique identifier of the room',
    example: 42
  })
  @UseGuards(RolesGuard)
  @Roles(user_role.ADMIN)
  @Throttle({default: {limit: 10, ttl: 60000}})
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    try {
      const deletedRoom = await this.roomsService.delete(id);
      await this.cacheManager.del(`/rooms/${id}`);
      await this.cacheManager.del('/rooms');
      return deletedRoom;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Room with ID ${id} not found`);
      }
      throw error;
    }
  }
}
