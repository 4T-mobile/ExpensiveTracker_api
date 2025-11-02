import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/database/prisma.service';

describe('ExpenseTracker E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Clean database before running tests
    await prisma.refreshToken.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.budget.deleteMany();
    await prisma.category.deleteMany({ where: { isDefault: false } });
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // Clean up after tests
    await prisma.refreshToken.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.budget.deleteMany();
    await prisma.category.deleteMany({ where: { isDefault: false } });
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('Authentication Flow (e2e)', () => {
    const testUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test123!@#',
    };

    let accessToken: string;
    let refreshToken: string;

    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201)
        .then((response) => {
          expect(response.body.data).toHaveProperty('user');
          expect(response.body.data).toHaveProperty('accessToken');
          expect(response.body.data).toHaveProperty('refreshToken');
          expect(response.body.data.user.email).toBe(testUser.email);
          accessToken = response.body.data.accessToken;
          refreshToken = response.body.data.refreshToken;
        });
    });

    it('should not register with duplicate email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(409);
    });

    it('should login with correct credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          emailOrUsername: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .then((response) => {
          expect(response.body.data).toHaveProperty('accessToken');
          expect(response.body.data).toHaveProperty('refreshToken');
        });
    });

    it('should not login with incorrect password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          emailOrUsername: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('should get current user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body.data.email).toBe(testUser.email);
        });
    });

    it('should not access protected route without token', () => {
      return request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
    });

    it('should refresh access token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200)
        .then((response) => {
          expect(response.body.data).toHaveProperty('accessToken');
          expect(response.body.data).toHaveProperty('refreshToken');
        });
    });

    it('should logout successfully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);
    });
  });
});
