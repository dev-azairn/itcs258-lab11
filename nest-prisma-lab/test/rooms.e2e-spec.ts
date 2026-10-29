import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { jest } from '@jest/globals';
import request from 'supertest';
import type { CreateRoomDto } from '../src/rooms/dto/create-room.dto';
import type { UpdateRoomDto } from '../src/rooms/dto/update-room.dto';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { user_role } from '../generated/prisma/enums';
import * as bcrypt from 'bcrypt';

jest.mock('cache-manager-redis-yet', () => ({
  redisStore: () => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  }),
}));


describe('RoomsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  // Global data use
  let createdRoomId: number | undefined;
  let adminUserId: number | undefined;
  let roomName: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get<PrismaService>(PrismaService);

    const email = `test-admin-${Date.now()}@example.com`;
    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user as admin to log in
    const admin = await prisma.user.create({
      data: {
        email,
        password_hash: passwordHash,
        name: 'Rooms E2E Admin',
        role: user_role.ADMIN,
      },
    });
    adminUserId = admin.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    accessToken = loginResponse.body.access_token;
    roomName = `E2E Room ${Date.now()}`;
  });

  // Clean up the test data before testing
  afterAll(async () => {
    if (createdRoomId !== undefined) {
      await prisma.rooms.deleteMany({ where: { id: createdRoomId } });
    }
    if (prisma && adminUserId !== undefined) {
      await prisma.user.deleteMany({ where: { id: adminUserId } });
    }
    if (app) {
      await app.close();
    }
  });

  // A valid admin request creates and returns a room.
  it('/rooms (POST) - Create Room', async () => {
    const createDto: CreateRoomDto = {
      name: roomName,
      description: 'Room created by the E2E test',
      capacity: 3,
      price_per_night: 1800,
    };

    const response = await request(app.getHttpServer())
      .post('/rooms')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(createDto)
      .expect(201);

    // Test that data is valid
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(roomName);
    // Set ID after creating
    createdRoomId = response.body.id;
  });

  // The endpoint returns the list of rooms, including the room created above.
  it('/rooms (GET) - Get All Rooms', async () => {
    const response = await request(app.getHttpServer())
      .get('/rooms')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: createdRoomId, name: roomName })]),
    );
  });

  // The endpoint returns the room created above for its ID.
  it('/rooms/:id (GET) - Get Room', async () => {
    const response = await request(app.getHttpServer())
      .get(`/rooms/${createdRoomId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: createdRoomId,
      name: roomName,
      capacity: 3,
    });
  });

  // Requests without a valid token are rejected.
  it('/rooms (GET) - Fail Unauthorized', async () => {
    await request(app.getHttpServer()).get('/rooms').expect(403);
  });

  // An admin can update room details successfully.
  it('/rooms/:id (PUT) - Update Room', async () => {
    const updateDto: UpdateRoomDto = {
      name: `${roomName} - Updated`,
      price_per_night: 2000,
    };

    const response = await request(app.getHttpServer())
      .put(`/rooms/${createdRoomId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updateDto)
      .expect(200);

    expect(response.body.name).toBe(updateDto.name);
    expect(Number(response.body.price_per_night)).toBe(updateDto.price_per_night);
  });

  // Updating a missing room returns 404.
  it('/rooms/:id (PUT) - Fail Not Found', async () => {
    await request(app.getHttpServer())
      .put('/rooms/999999')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Missing Room' })
      .expect(404);
  });

  // Admin requests can disable and then re-enable a room.
  it('/rooms/:id/disable and /rooms/:id/enable (PATCH) - Update Room Status', async () => {
    const disabledResponse = await request(app.getHttpServer())
      .patch(`/rooms/${createdRoomId}/disable`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(disabledResponse.body.is_active).toBe(false);

    const enabledResponse = await request(app.getHttpServer())
      .patch(`/rooms/${createdRoomId}/enable`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(enabledResponse.body.is_active).toBe(true);
  });

  describe('delete', () => {
    // An admin can delete the room, which is then absent from the database.
    it('/rooms/:id (DELETE) - Delete Room', async () => {
      await request(app.getHttpServer())
        .delete(`/rooms/${createdRoomId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      await request(app.getHttpServer())
          .get(`/rooms/${createdRoomId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(404);
    });

    // Deleting a room that does not exist returns 404.
    it('/rooms/:id (DELETE) - Fail Not Found', async () => {
      await request(app.getHttpServer())
        .delete('/rooms/999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
