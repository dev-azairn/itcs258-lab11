import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

jest.mock('./rooms.service', () => ({
  RoomsService: class RoomsService {},
}));

jest.mock('../auth/guard/auth.guard', () => ({
  JwtAuthGuard: class JwtAuthGuard {},
}));

jest.mock('@nestjs/cache-manager', () => ({
  CacheInterceptor: class CacheInterceptor {},
}));

jest.mock('@nestjs/throttler', () => ({
  Throttle: () => () => undefined,
}));

const mockRoomsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  disable: jest.fn(),
  enable: jest.fn(),
  delete: jest.fn(),
};

const mockCacheManager = {
  del: jest.fn().mockResolvedValue(undefined),
};

describe('RoomsController Integration', () => {
  let controller: RoomsController;
  let service: RoomsService;

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomsController],
      providers: [
        {
          provide: RoomsService,
          useValue: mockRoomsService,
        },
        {
          provide: 'CACHE_MANAGER',
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    controller = module.get<RoomsController>(RoomsController);
    service = module.get<RoomsService>(RoomsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a room through the service', async () => {
      const dto: CreateRoomDto = {
        name: 'Deluxe Room',
        description: 'Room for up to 3 guests',
        capacity: 3,
        price_per_night: 1800,
      };
      const room = { id: 1, ...dto, is_active: true };
      mockRoomsService.create.mockResolvedValue(room);

      await expect(controller.create(dto)).resolves.toBe(room);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all rooms from the service', async () => {
      const rooms = [
        { id: 1, name: 'Deluxe Room', capacity: 3, price_per_night: 1800, is_active: true },
        { id: 2, name: 'Family Room', capacity: 5, price_per_night: 2600, is_active: false },
      ];
      mockRoomsService.findAll.mockResolvedValue(rooms);

      await expect(controller.findAll()).resolves.toBe(rooms);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return the requested room', async () => {
      const room = { id: 7, name: 'Suite', capacity: 4, price_per_night: 3200, is_active: true };
      mockRoomsService.findOne.mockResolvedValue(room);

      await expect(controller.findOne(7)).resolves.toBe(room);
      expect(service.findOne).toHaveBeenCalledWith(7);
    });

    it('should propagate a not-found error from the service', async () => {
      mockRoomsService.findOne.mockRejectedValue(new NotFoundException('Room 99 not found'));

      await expect(controller.findOne(99)).rejects.toThrow('Room 99 not found');
      expect(service.findOne).toHaveBeenCalledWith(99);
    });
  });

  describe('update', () => {
    it('should update the requested room', async () => {
      const dto: UpdateRoomDto = { name: 'Updated Suite', price_per_night: 3500 };
      const room = { id: 7, ...dto, capacity: 4, is_active: true };
      mockRoomsService.update.mockResolvedValue(room);

      await expect(controller.update(7, dto)).resolves.toBe(room);
      expect(service.update).toHaveBeenCalledWith(7, dto);
    });
  });

  describe('disable', () => {
    it('should disable the requested room', async () => {
      const room = { id: 7, name: 'Suite', capacity: 4, price_per_night: 3200, is_active: false };
      mockRoomsService.disable.mockResolvedValue(room);

      await expect(controller.disable(7)).resolves.toBe(room);
      expect(service.disable).toHaveBeenCalledWith(7);
    });
  });

  describe('enable', () => {
    it('should enable the requested room', async () => {
      const room = { id: 7, name: 'Suite', capacity: 4, price_per_night: 3200, is_active: true };
      mockRoomsService.enable.mockResolvedValue(room);

      await expect(controller.enable(7)).resolves.toBe(room);
      expect(service.enable).toHaveBeenCalledWith(7);
    });
  });

  describe('delete', () => {
    it('should delete the requested room', async () => {
      const room = { id: 7, name: 'Suite', capacity: 4, price_per_night: 3200, is_active: true };
      mockRoomsService.delete.mockResolvedValue(room);

      await expect(controller.delete(7)).resolves.toBe(room);
      expect(service.delete).toHaveBeenCalledWith(7);
      expect(mockCacheManager.del).toHaveBeenCalledWith('/rooms/7');
      expect(mockCacheManager.del).toHaveBeenCalledWith('/rooms');
    });
  });
});
