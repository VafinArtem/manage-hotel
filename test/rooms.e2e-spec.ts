import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { Types } from 'mongoose';
import { AppModule } from '../src/app.module';
import { RoomType } from '../src/rooms/rooms.model';

const ADMIN_EMAIL = 'admin@test.ru';
const USER_EMAIL = 'user@test.ru';
const PASSWORD = 'password';

async function loginAs(
  app: INestApplication<App>,
  email: string,
): Promise<string> {
  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password: PASSWORD })
    .expect(200);

  return res.body.access_token;
}

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

describe('RoomsController (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let userToken: string;

  const createRoomDto = {
    roomNumber: 101,
    roomType: RoomType.LUXE,
    seaView: true,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    adminToken = await loginAs(app, ADMIN_EMAIL);
    userToken = await loginAs(app, USER_EMAIL);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /rooms/create', () => {
    it('should return 403 for regular user', async () => {
      await request(app.getHttpServer())
        .post('/rooms/create')
        .set(authHeader(userToken))
        .send(createRoomDto)
        .expect(403);
    });

    it('should create a room (201) for admin and verify fields then delete', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/rooms/create')
        .set(authHeader(adminToken))
        .send(createRoomDto)
        .expect(201);

      const id = createRes.body._id;

      const getRes = await request(app.getHttpServer())
        .get(`/rooms/${id}`)
        .expect(200);

      expect(getRes.body.roomNumber).toBe(createRoomDto.roomNumber);
      expect(getRes.body.roomType).toBe(createRoomDto.roomType);
      expect(getRes.body.seaView).toBe(createRoomDto.seaView);

      await request(app.getHttpServer())
        .delete(`/rooms/${id}`)
        .set(authHeader(adminToken))
        .expect(200);
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/rooms/create')
        .send(createRoomDto)
        .expect(401);
    });

    it('should return 400 for invalid field values', async () => {
      await request(app.getHttpServer())
        .post('/rooms/create')
        .set(authHeader(adminToken))
        .send({
          roomNumber: 'not-a-number',
          roomType: 'INVALID_TYPE',
          seaView: 'not-boolean',
        })
        .expect(400);
    });
  });

  describe('GET /rooms/:id', () => {
    let createdRoomId: string;

    beforeAll(async () => {
      const createRes = await request(app.getHttpServer())
        .post('/rooms/create')
        .set(authHeader(adminToken))
        .send(createRoomDto)
        .expect(201);

      createdRoomId = createRes.body._id;
    });

    afterAll(async () => {
      await request(app.getHttpServer())
        .delete(`/rooms/${createdRoomId}`)
        .set(authHeader(adminToken))
        .expect(200);
    });

    it('should return room by id (200)', async () => {
      const getRes = await request(app.getHttpServer())
        .get(`/rooms/${createdRoomId}`)
        .expect(200);

      expect(getRes.body.roomNumber).toBe(createRoomDto.roomNumber);
      expect(getRes.body.roomType).toBe(createRoomDto.roomType);
      expect(getRes.body.seaView).toBe(createRoomDto.seaView);
    });

    it('should return 404 for non-existent id', async () => {
      const fakeId = new Types.ObjectId().toString();

      await request(app.getHttpServer()).get(`/rooms/${fakeId}`).expect(404);
    });
  });

  describe('GET /rooms/getAll', () => {
    let createdRoomId: string;

    beforeAll(async () => {
      const createRes = await request(app.getHttpServer())
        .post('/rooms/create')
        .set(authHeader(adminToken))
        .send(createRoomDto)
        .expect(201);

      createdRoomId = createRes.body._id;
    });

    afterAll(async () => {
      await request(app.getHttpServer())
        .delete(`/rooms/${createdRoomId}`)
        .set(authHeader(adminToken))
        .expect(200);
    });

    it('should return array of rooms (200)', async () => {
      const getAllRes = await request(app.getHttpServer())
        .get('/rooms/getAll')
        .expect(200);

      expect(Array.isArray(getAllRes.body)).toBe(true);
      expect(getAllRes.body.length).toBeGreaterThanOrEqual(1);

      const created = getAllRes.body.find(
        (room: { _id: string }) => room._id === createdRoomId,
      );
      expect(created).toBeDefined();
    });
  });

  describe('PATCH /rooms/:id', () => {
    let createdRoomId: string;

    const updateDto = {
      roomNumber: 202,
      roomType: RoomType.ECONOMY,
      seaView: false,
    };

    beforeAll(async () => {
      const createRes = await request(app.getHttpServer())
        .post('/rooms/create')
        .set(authHeader(adminToken))
        .send(createRoomDto)
        .expect(201);

      createdRoomId = createRes.body._id;
    });

    afterAll(async () => {
      await request(app.getHttpServer())
        .delete(`/rooms/${createdRoomId}`)
        .set(authHeader(adminToken))
        .expect(200);
    });

    it('should return 403 for regular user', async () => {
      await request(app.getHttpServer())
        .patch(`/rooms/${createdRoomId}`)
        .set(authHeader(userToken))
        .send(updateDto)
        .expect(403);
    });

    it('should update room fields (200) for admin', async () => {
      await request(app.getHttpServer())
        .patch(`/rooms/${createdRoomId}`)
        .set(authHeader(adminToken))
        .send(updateDto)
        .expect(200);

      const getRes = await request(app.getHttpServer())
        .get(`/rooms/${createdRoomId}`)
        .expect(200);

      expect(getRes.body.roomNumber).toBe(updateDto.roomNumber);
      expect(getRes.body.roomType).toBe(updateDto.roomType);
      expect(getRes.body.seaView).toBe(updateDto.seaView);
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .patch(`/rooms/${createdRoomId}`)
        .send(updateDto)
        .expect(401);
    });

    it('should return 200 with matchedCount=0 for non-existent id', async () => {
      const fakeId = new Types.ObjectId().toString();

      const res = await request(app.getHttpServer())
        .patch(`/rooms/${fakeId}`)
        .set(authHeader(adminToken))
        .send(createRoomDto)
        .expect(200);

      expect(res.body.matchedCount).toBe(0);
    });

    it('should return 400 for invalid field values', async () => {
      await request(app.getHttpServer())
        .patch(`/rooms/${new Types.ObjectId().toString()}`)
        .set(authHeader(adminToken))
        .send({
          roomNumber: 'not-a-number',
          roomType: 'INVALID_TYPE',
          seaView: 'not-boolean',
        })
        .expect(400);
    });
  });

  describe('DELETE /rooms/:id', () => {
    it('should return 403 for regular user', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/rooms/create')
        .set(authHeader(adminToken))
        .send(createRoomDto)
        .expect(201);

      const id = createRes.body._id;

      await request(app.getHttpServer())
        .delete(`/rooms/${id}`)
        .set(authHeader(userToken))
        .expect(403);

      await request(app.getHttpServer())
        .delete(`/rooms/${id}`)
        .set(authHeader(adminToken))
        .expect(200);
    });

    it('should delete room (200) for admin and then return 404 on GET', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/rooms/create')
        .set(authHeader(adminToken))
        .send(createRoomDto)
        .expect(201);

      const id = createRes.body._id;

      await request(app.getHttpServer())
        .delete(`/rooms/${id}`)
        .set(authHeader(adminToken))
        .expect(200);

      await request(app.getHttpServer()).get(`/rooms/${id}`).expect(404);
    });

    it('should return 401 without token', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/rooms/create')
        .set(authHeader(adminToken))
        .send(createRoomDto)
        .expect(201);

      const id = createRes.body._id;

      await request(app.getHttpServer()).delete(`/rooms/${id}`).expect(401);

      await request(app.getHttpServer())
        .delete(`/rooms/${id}`)
        .set(authHeader(adminToken))
        .expect(200);
    });

    it('should return 404 for non-existent id', async () => {
      const fakeId = new Types.ObjectId().toString();

      await request(app.getHttpServer())
        .delete(`/rooms/${fakeId}`)
        .set(authHeader(adminToken))
        .expect(404);
    });
  });
});
