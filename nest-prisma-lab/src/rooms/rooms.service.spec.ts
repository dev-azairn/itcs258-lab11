import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

const mockPrismaService = {
  rooms: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('RoomsService', () => {
  let service: RoomsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a room with default active status', async () => {
    const dto = {
      name: 'Deluxe Room', 
      description: 'Room for 2 guests',
      capacity: 2,
      price_per_night: 1500,
    };
    const room = { id: 1, ...dto, is_active: true };

    mockPrismaService.rooms.create.mockResolvedValue(room);

    await expect(service.create(dto)).resolves.toEqual(room);
    expect(prisma.rooms.create).toHaveBeenCalledWith({
      data: {
        ...dto,
        is_active: true,
      },
    });
  });

  it('should return all rooms', async () => {
    const rooms = [
      { id: 1, name: 'Deluxe Room', capacity: 2, price_per_night: 1500, is_active: true },
      { id: 2, name: 'Suite', capacity: 4, price_per_night: 2500, is_active: false },
    ];

    mockPrismaService.rooms.findMany.mockResolvedValue(rooms);
    
    await expect(service.findAll()).resolves.toEqual(rooms);
    expect(prisma.rooms.findMany).toHaveBeenCalled();
  });

  it('should return a room by id', async () => {
    const room = {
      id: 1,
      name: 'Deluxe Room',
      capacity: 2,
      price_per_night: 1500,
      is_active: true,
    };

    mockPrismaService.rooms.findUnique.mockResolvedValue(room);

    await expect(service.findOne(1)).resolves.toEqual(room);
    expect(prisma.rooms.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('should throw NotFoundException when room is missing', async () => {
    mockPrismaService.rooms.findUnique.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    await expect(service.findOne(99)).rejects.toThrow('Room 99 not found');
  });

  it('should update a room', async () => {
    const existingRoom = {
      id: 1,
      name: 'Deluxe Room',
      capacity: 2,
      price_per_night: 1500,
      is_active: true,
    };
    const updatedRoom = {
      ...existingRoom,
      name: 'Updated Deluxe Room',
      price_per_night: 1800,
    };

    mockPrismaService.rooms.findUnique.mockResolvedValue(existingRoom);
    mockPrismaService.rooms.update.mockResolvedValue(updatedRoom);

    await expect(service.update(1, { name: 'Updated Deluxe Room', price_per_night: 1800 })).resolves.toEqual(updatedRoom);
    expect(prisma.rooms.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(prisma.rooms.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { name: 'Updated Deluxe Room', price_per_night: 1800 },
    });
  });

  it('should disable a room', async () => {
    const existingRoom = {
      id: 1,
      name: 'Deluxe Room',
      capacity: 2,
      price_per_night: 1500,
      is_active: true,
    };
    const disabledRoom = { ...existingRoom, is_active: false };

    mockPrismaService.rooms.findUnique.mockResolvedValue(existingRoom);
    mockPrismaService.rooms.update.mockResolvedValue(disabledRoom);

    await expect(service.disable(1)).resolves.toEqual(disabledRoom);
    expect(prisma.rooms.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { is_active: false },
    });
  });

  it('should enable a room', async () => {
    const existingRoom = {
      id: 1,
      name: 'Deluxe Room',
      capacity: 2,
      price_per_night: 1500,
      is_active: false,
    };
    const enabledRoom = { ...existingRoom, is_active: true };

    mockPrismaService.rooms.findUnique.mockResolvedValue(existingRoom);
    mockPrismaService.rooms.update.mockResolvedValue(enabledRoom);

    await expect(service.enable(1)).resolves.toEqual(enabledRoom);
    expect(prisma.rooms.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { is_active: true },
    });
  });

  it('should delete a room', async () => {
    const room = {
      id: 1,
      name: 'Deluxe Room',
      capacity: 2,
      price_per_night: 1500,
      is_active: true,
    };

    mockPrismaService.rooms.findUnique.mockResolvedValue(room);
    mockPrismaService.rooms.delete.mockResolvedValue(room);

    await expect(service.delete(1)).resolves.toEqual(room);
    expect(prisma.rooms.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

});
