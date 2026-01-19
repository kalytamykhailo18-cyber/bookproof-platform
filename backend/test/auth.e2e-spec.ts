import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, Module } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '@common/prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { AuthController } from '../src/modules/auth/auth.controller';
import { AuthService } from '../src/modules/auth/auth.service';
import { JwtStrategy } from '../src/modules/auth/strategies/jwt.strategy';
import { LocalStrategy } from '../src/modules/auth/strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../src/common/prisma/prisma.module';
import { EmailModule } from '../src/modules/email/email.module';
import { AuditModule } from '../src/modules/audit/audit.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from '../src/config/app.config';
import jwtConfig from '../src/config/jwt.config';

// Create a minimal AuthModule for testing without AffiliatesModule
@Module({
  imports: [
    PrismaModule,
    PassportModule,
    EmailModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn') || '7d',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
class TestAuthModule {}

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfig, jwtConfig],
        }),
        TestAuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply global validation pipe (same as main.ts)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.user.deleteMany({
      where: {
        email: {
          endsWith: '@test.com',
        },
      },
    });
  });

  describe('POST /auth/register', () => {
    it('should register new author successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'author@test.com',
          password: 'Test123!@#',
          name: 'Test Author',
          role: UserRole.AUTHOR,
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('author@test.com');
      expect(response.body.user.role).toBe(UserRole.AUTHOR);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should register new reader successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'reader@test.com',
          password: 'Test123!@#',
          name: 'Test Reader',
          role: UserRole.READER,
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user.role).toBe(UserRole.READER);
    });

    it('should prevent duplicate email registration', async () => {
      // Register first user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@test.com',
          password: 'Test123!@#',
          name: 'Test User 1',
          role: UserRole.AUTHOR,
        })
        .expect(201);

      // Try to register with same email
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@test.com',
          password: 'Different123!@#',
          name: 'Test User 2',
          role: UserRole.READER,
        })
        .expect(409);

      expect(response.body.message).toContain('already exists');
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          // Missing password
          name: 'Test User',
          role: UserRole.AUTHOR,
        })
        .expect(400);
    });

    it('should validate email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Test123!@#',
          name: 'Test User',
          role: UserRole.AUTHOR,
        })
        .expect(400);
    });

    it('should validate password strength', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'weak',
          name: 'Test User',
          role: UserRole.AUTHOR,
        })
        .expect(400);
    });

    it('should create authorProfile for AUTHOR role', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'new-author@test.com',
          password: 'Test123!@#',
          name: 'New Author',
          role: UserRole.AUTHOR,
        })
        .expect(201);

      const user = await prisma.user.findUnique({
        where: { email: 'new-author@test.com' },
        include: { authorProfile: true },
      });

      expect(user).toBeTruthy();
      expect(user?.authorProfile).toBeTruthy();
      expect(user?.authorProfile?.availableCredits).toBe(0);
    });

    it('should create readerProfile for READER role', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'new-reader@test.com',
          password: 'Test123!@#',
          name: 'New Reader',
          role: UserRole.READER,
        })
        .expect(201);

      const user = await prisma.user.findUnique({
        where: { email: 'new-reader@test.com' },
        include: { readerProfile: true },
      });

      expect(user).toBeTruthy();
      expect(user?.readerProfile).toBeTruthy();
      expect(user?.readerProfile?.walletBalance.toNumber()).toBe(0);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create test user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'login-test@test.com',
          password: 'Test123!@#',
          name: 'Login Test User',
          role: UserRole.AUTHOR,
        });
    });

    it('should login with correct credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login-test@test.com',
          password: 'Test123!@#',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('login-test@test.com');
    });

    it('should reject incorrect password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login-test@test.com',
          password: 'WrongPassword123!@#',
        })
        .expect(401);
    });

    it('should reject non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'Test123!@#',
        })
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    let token: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'me-test@test.com',
          password: 'Test123!@#',
          name: 'Me Test User',
          role: UserRole.AUTHOR,
        });

      token = response.body.accessToken;
    });

    it('should return user info with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.email).toBe('me-test@test.com');
      expect(response.body.name).toBe('Me Test User');
      expect(response.body.role).toBe(UserRole.AUTHOR);
    });

    it('should reject request without token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });

    it('should reject request with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Password Hashing', () => {
    it('should not store plain password', async () => {
      const plainPassword = 'Test123!@#';

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'hash-test@test.com',
          password: plainPassword,
          name: 'Hash Test User',
          role: UserRole.AUTHOR,
        });

      const user = await prisma.user.findUnique({
        where: { email: 'hash-test@test.com' },
      });

      expect(user?.passwordHash).not.toBe(plainPassword);
      expect(user?.passwordHash).toMatch(/^\$2[aby]\$/); // bcrypt hash format
    });
  });
});
