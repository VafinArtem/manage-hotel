import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { Types } from 'mongoose';
import { AppModule } from '../src/app.module';

describe('ScheduleController (e2e)', () => {
  let app: INestApplication<App>;

  const uniqueRoomId = () => new Types.ObjectId().toString();

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

  describe('POST /schedule/create', () => {
    it('should create a schedule item (201) and verify fields then delete', async () => {
      const dto = {
        date: '2026-07-15',
        roomId: uniqueRoomId(),
        isDeleted: false,
      };

      const createRes = await request(app.getHttpServer())
        .post('/schedule/create')
        .send(dto)
        .expect(201);

      const id = createRes.body._id;

      const getRes = await request(app.getHttpServer())
        .get(`/schedule/${id}`)
        .expect(200);

      expect(getRes.body.date).toBe(dto.date);
      expect(getRes.body.roomId).toBe(dto.roomId);
      expect(getRes.body.isDeleted).toBe(false);

      await request(app.getHttpServer()).delete(`/schedule/${id}`).expect(200);
    });

    it('should return 400 for invalid field values', async () => {
      await request(app.getHttpServer())
        .post('/schedule/create')
        .send({
          date: 12345,
          roomId: 'not-a-mongo-id',
          isDeleted: 'not-boolean',
        })
        .expect(400);
    });

    it('should return 409 for duplicate roomId + date', async () => {
      const dto = {
        date: '2026-07-16',
        roomId: uniqueRoomId(),
        isDeleted: false,
      };

      await request(app.getHttpServer())
        .post('/schedule/create')
        .send(dto)
        .expect(201);

      await request(app.getHttpServer())
        .post('/schedule/create')
        .send(dto)
        .expect(409);
    });
  });

  describe('GET /schedule/:id', () => {
    it('should return schedule item by id (200)', async () => {
      const dto = {
        date: '2026-07-17',
        roomId: uniqueRoomId(),
        isDeleted: false,
      };

      const createRes = await request(app.getHttpServer())
        .post('/schedule/create')
        .send(dto)
        .expect(201);

      const id = createRes.body._id;

      const getRes = await request(app.getHttpServer())
        .get(`/schedule/${id}`)
        .expect(200);

      expect(getRes.body.date).toBe(dto.date);

      await request(app.getHttpServer()).delete(`/schedule/${id}`).expect(200);
    });

    it('should return 404 for non-existent id', async () => {
      const fakeId = new Types.ObjectId().toString();

      await request(app.getHttpServer()).get(`/schedule/${fakeId}`).expect(404);
    });

    it('should return 404 for soft-deleted item', async () => {
      const dto = {
        date: '2026-07-18',
        roomId: uniqueRoomId(),
        isDeleted: false,
      };

      const createRes = await request(app.getHttpServer())
        .post('/schedule/create')
        .send(dto)
        .expect(201);

      const id = createRes.body._id;

      await request(app.getHttpServer()).delete(`/schedule/${id}`).expect(200);

      await request(app.getHttpServer()).get(`/schedule/${id}`).expect(404);
    });
  });

  describe('GET /schedule/getAll', () => {
    it('should return array of schedule items (200)', async () => {
      const dto = {
        date: '2026-07-19',
        roomId: uniqueRoomId(),
        isDeleted: false,
      };

      const createRes = await request(app.getHttpServer())
        .post('/schedule/create')
        .send(dto)
        .expect(201);

      const id = createRes.body._id;

      const getAllRes = await request(app.getHttpServer())
        .get('/schedule/getAll')
        .expect(200);

      expect(Array.isArray(getAllRes.body)).toBe(true);
      expect(getAllRes.body.length).toBeGreaterThanOrEqual(1);

      const created = getAllRes.body.find(
        (item: { _id: string }) => item._id === id,
      );
      expect(created).toBeDefined();

      await request(app.getHttpServer()).delete(`/schedule/${id}`).expect(200);
    });

    it('should not return soft-deleted items', async () => {
      const dto = {
        date: '2026-07-20',
        roomId: uniqueRoomId(),
        isDeleted: false,
      };

      const createRes = await request(app.getHttpServer())
        .post('/schedule/create')
        .send(dto)
        .expect(201);

      const id = createRes.body._id;

      await request(app.getHttpServer()).delete(`/schedule/${id}`).expect(200);

      const getAllRes = await request(app.getHttpServer())
        .get('/schedule/getAll')
        .expect(200);

      const found = getAllRes.body.find(
        (item: { _id: string }) => item._id === id,
      );
      expect(found).toBeUndefined();
    });
  });

  describe('PATCH /schedule/:id', () => {
    it('should update schedule item fields (200)', async () => {
      const dto = {
        date: '2026-07-21',
        roomId: uniqueRoomId(),
        isDeleted: false,
      };

      const createRes = await request(app.getHttpServer())
        .post('/schedule/create')
        .send(dto)
        .expect(201);

      const id = createRes.body._id;

      const updateDto = {
        date: '2026-08-20',
        roomId: uniqueRoomId(),
        isDeleted: false,
      };

      await request(app.getHttpServer())
        .patch(`/schedule/${id}`)
        .send(updateDto)
        .expect(200);

      const getRes = await request(app.getHttpServer())
        .get(`/schedule/${id}`)
        .expect(200);

      expect(getRes.body.date).toBe(updateDto.date);
      expect(getRes.body.roomId).toBe(updateDto.roomId);

      await request(app.getHttpServer()).delete(`/schedule/${id}`).expect(200);
    });

    it('should return null for non-existent id', async () => {
      const fakeId = new Types.ObjectId().toString();

      const res = await request(app.getHttpServer())
        .patch(`/schedule/${fakeId}`)
        .send({
          date: '2026-07-22',
          roomId: uniqueRoomId(),
          isDeleted: false,
        })
        .expect(200);

      expect(res.body).toEqual({});
    });

    it('should return null for soft-deleted item', async () => {
      const dto = {
        date: '2026-07-23',
        roomId: uniqueRoomId(),
        isDeleted: false,
      };

      const createRes = await request(app.getHttpServer())
        .post('/schedule/create')
        .send(dto)
        .expect(201);

      const id = createRes.body._id;

      await request(app.getHttpServer()).delete(`/schedule/${id}`).expect(200);

      const res = await request(app.getHttpServer())
        .patch(`/schedule/${id}`)
        .send(dto)
        .expect(200);

      expect(res.body).toEqual({});
    });

    it('should return 400 for invalid field values', async () => {
      await request(app.getHttpServer())
        .patch(`/schedule/${new Types.ObjectId().toString()}`)
        .send({
          date: 12345,
          roomId: 'not-a-mongo-id',
          isDeleted: 'not-boolean',
        })
        .expect(400);
    });
  });

  describe('DELETE /schedule/:id', () => {
    it('should soft-delete schedule item (200) and then return 404 on GET', async () => {
      const dto = {
        date: '2026-07-24',
        roomId: uniqueRoomId(),
        isDeleted: false,
      };

      const createRes = await request(app.getHttpServer())
        .post('/schedule/create')
        .send(dto)
        .expect(201);

      const id = createRes.body._id;

      await request(app.getHttpServer()).delete(`/schedule/${id}`).expect(200);

      await request(app.getHttpServer()).get(`/schedule/${id}`).expect(404);
    });

    it('should return 200 even for non-existent id', async () => {
      const fakeId = new Types.ObjectId().toString();

      await request(app.getHttpServer())
        .delete(`/schedule/${fakeId}`)
        .expect(200);
    });
  });
});
