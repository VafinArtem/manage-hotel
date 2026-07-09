import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { Types } from 'mongoose';
import { AppModule } from '../src/app.module';
import { RoomType } from '../src/rooms/rooms.model';

describe('RoomsController (e2e)', () => {
  let app: INestApplication<App>;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /rooms/create', () => {
    it('should create a room (201) and verify fields then delete', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/rooms/create')
        .send(createRoomDto)
        .expect(201);

      const id = createRes.body._id;

      const getRes = await request(app.getHttpServer())
        .get(`/rooms/${id}`)
        .expect(200);

      expect(getRes.body.roomNumber).toBe(createRoomDto.roomNumber);
      expect(getRes.body.roomType).toBe(createRoomDto.roomType);
      expect(getRes.body.seaView).toBe(createRoomDto.seaView);

      await request(app.getHttpServer()).delete(`/rooms/${id}`).expect(200);
    });

    it('should return 400 for invalid field values', async () => {
      await request(app.getHttpServer())
        .post('/rooms/create')
        .send({
          roomNumber: 'not-a-number',
          roomType: 'INVALID_TYPE',
          seaView: 'not-boolean',
        })
        .expect(400);
    });
  });

  describe('GET /rooms/:id', () => {
    it('should return room by id (200)', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/rooms/create')
        .send(createRoomDto)
        .expect(201);

      const id = createRes.body._id;

      const getRes = await request(app.getHttpServer())
        .get(`/rooms/${id}`)
        .expect(200);

      expect(getRes.body.roomNumber).toBe(createRoomDto.roomNumber);
      expect(getRes.body.roomType).toBe(createRoomDto.roomType);
      expect(getRes.body.seaView).toBe(createRoomDto.seaView);

      await request(app.getHttpServer()).delete(`/rooms/${id}`).expect(200);
    });

    it('should return 404 for non-existent id', async () => {
      const fakeId = new Types.ObjectId().toString();

      await request(app.getHttpServer()).get(`/rooms/${fakeId}`).expect(404);
    });
  });

  describe('GET /rooms/getAll', () => {
    it('should return array of rooms (200)', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/rooms/create')
        .send(createRoomDto)
        .expect(201);

      const id = createRes.body._id;

      const getAllRes = await request(app.getHttpServer())
        .get('/rooms/getAll')
        .expect(200);

      expect(Array.isArray(getAllRes.body)).toBe(true);
      expect(getAllRes.body.length).toBeGreaterThanOrEqual(1);

      const created = getAllRes.body.find(
        (room: { _id: string }) => room._id === id,
      );
      expect(created).toBeDefined();

      await request(app.getHttpServer()).delete(`/rooms/${id}`).expect(200);
    });
  });

  describe('PATCH /rooms/:id', () => {
    it('should update room fields (200)', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/rooms/create')
        .send(createRoomDto)
        .expect(201);

      const id = createRes.body._id;

      const updateDto = {
        roomNumber: 202,
        roomType: RoomType.ECONOMY,
        seaView: false,
      };

      await request(app.getHttpServer())
        .patch(`/rooms/${id}`)
        .send(updateDto)
        .expect(200);

      const getRes = await request(app.getHttpServer())
        .get(`/rooms/${id}`)
        .expect(200);

      expect(getRes.body.roomNumber).toBe(updateDto.roomNumber);
      expect(getRes.body.roomType).toBe(updateDto.roomType);
      expect(getRes.body.seaView).toBe(updateDto.seaView);

      await request(app.getHttpServer()).delete(`/rooms/${id}`).expect(200);
    });

    it('should return 200 with matchedCount=0 for non-existent id', async () => {
      const fakeId = new Types.ObjectId().toString();

      const res = await request(app.getHttpServer())
        .patch(`/rooms/${fakeId}`)
        .send(createRoomDto)
        .expect(200);

      expect(res.body.matchedCount).toBe(0);
    });
  });

  describe('DELETE /rooms/:id', () => {
    it('should delete room (200) and then return 404 on GET', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/rooms/create')
        .send(createRoomDto)
        .expect(201);

      const id = createRes.body._id;

      await request(app.getHttpServer()).delete(`/rooms/${id}`).expect(200);

      await request(app.getHttpServer()).get(`/rooms/${id}`).expect(404);
    });

    it('should return 404 for non-existent id', async () => {
      const fakeId = new Types.ObjectId().toString();

      await request(app.getHttpServer()).delete(`/rooms/${fakeId}`).expect(404);
    });
  });
});
