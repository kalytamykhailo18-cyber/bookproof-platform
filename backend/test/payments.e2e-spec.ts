import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '@common/prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { AuthModule } from '../src/modules/auth/auth.module';
import { PaymentsModule } from '../src/modules/payments/payments.module';
import { CreditsModule } from '../src/modules/credits/credits.module';
import { PrismaModule } from '../src/common/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import appConfig from '../src/config/app.config';
import jwtConfig from '../src/config/jwt.config';

describe('Payments (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authorToken: string;
  let authorProfileId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfig, jwtConfig],
        }),
        PrismaModule,
        AuthModule,
        CreditsModule,
        PaymentsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();

    // Create test author
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'payment-author@test.com',
        password: 'Test123!@#',
        name: 'Payment Test Author',
        role: 'AUTHOR',
      });

    authorToken = response.body.accessToken;

    // Get author profile ID
    const userResponse = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${authorToken}`);

    const user = await prisma.user.findUnique({
      where: { id: userResponse.body.id },
      include: { authorProfile: true },
    });

    authorProfileId = user?.authorProfile?.id || '';
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('Package Tiers', () => {
    it('should get all available package tiers', async () => {
      const response = await request(app.getHttpServer())
        .get('/credits/packages')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Check package structure
      const pkg = response.body[0];
      expect(pkg).toHaveProperty('id');
      expect(pkg).toHaveProperty('name');
      expect(pkg).toHaveProperty('credits');
      expect(pkg).toHaveProperty('price');
      expect(pkg).toHaveProperty('stripePriceId');
    });

    it('should have correct package tier details', async () => {
      const response = await request(app.getHttpServer())
        .get('/credits/packages')
        .expect(200);

      // Check for standard packages (25, 50, 100, 250, 500, 1000 credits)
      const credits = response.body.map((pkg: any) => pkg.credits);
      expect(credits).toContain(25);
      expect(credits).toContain(50);
      expect(credits).toContain(100);

      // Check prices are positive
      response.body.forEach((pkg: any) => {
        expect(pkg.price).toBeGreaterThan(0);
        expect(pkg.stripePriceId).toBeTruthy();
      });
    });
  });

  describe('Stripe Checkout Session', () => {
    it('should create checkout session for authenticated author', async () => {
      // Get a package tier
      const packagesResponse = await request(app.getHttpServer())
        .get('/credits/packages')
        .expect(200);

      const packageTierId = packagesResponse.body[0].id;

      const response = await request(app.getHttpServer())
        .post('/credits/checkout-session')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          packageTierId,
          successUrl: 'http://localhost:3000/author/credits/success',
          cancelUrl: 'http://localhost:3000/author/credits/cancel',
        })
        .expect(201);

      expect(response.body).toHaveProperty('sessionId');
      expect(response.body).toHaveProperty('url');
      expect(response.body.url).toContain('checkout.stripe.com');
    });

    it('should reject checkout session without authentication', async () => {
      await request(app.getHttpServer())
        .post('/credits/checkout-session')
        .send({
          packageTierId: 'pkg_25',
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel',
        })
        .expect(401);
    });

    it('should reject checkout session with invalid package tier', async () => {
      await request(app.getHttpServer())
        .post('/credits/checkout-session')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          packageTierId: 'invalid-package-id',
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel',
        })
        .expect(404);
    });

    it('should reject checkout session with missing URLs', async () => {
      const packagesResponse = await request(app.getHttpServer())
        .get('/credits/packages')
        .expect(200);

      const packageTierId = packagesResponse.body[0].id;

      await request(app.getHttpServer())
        .post('/credits/checkout-session')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          packageTierId,
          // successUrl and cancelUrl are missing
        })
        .expect(400);
    });
  });

  describe('Stripe Webhook Handling', () => {
    it('should process payment success webhook (checkout.session.completed)', async () => {
      // Get package tier for test
      const packagesResponse = await request(app.getHttpServer())
        .get('/credits/packages')
        .expect(200);

      const packageTier = packagesResponse.body[0];

      // Get initial credit balance
      const initialBalance = await prisma.authorProfile.findUnique({
        where: { id: authorProfileId },
        select: { availableCredits: true },
      });

      const webhookPayload = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: `cs_test_${Date.now()}`,
            metadata: {
              authorProfileId,
              packageTierId: packageTier.id,
            },
            amount_total: packageTier.price * 100, // Stripe uses cents
            currency: 'usd',
            payment_status: 'paid',
          },
        },
      };

      // Note: In production, this would require valid Stripe signature
      // For testing, we'll need to mock or bypass signature verification
      await request(app.getHttpServer())
        .post('/webhooks/stripe')
        .send(webhookPayload)
        .expect(200);

      // Verify credits were added
      const updatedAuthor = await prisma.authorProfile.findUnique({
        where: { id: authorProfileId },
      });

      expect(updatedAuthor?.availableCredits).toBe(
        (initialBalance?.availableCredits || 0) + packageTier.credits,
      );

      // Verify transaction was logged
      const transaction = await prisma.creditTransaction.findFirst({
        where: {
          authorProfileId,
          type: 'PURCHASE',
          amount: packageTier.credits,
        },
      });

      expect(transaction).toBeTruthy();
      expect(transaction?.amount).toBe(packageTier.credits);
    });

    it('should handle duplicate webhooks (idempotency)', async () => {
      const packagesResponse = await request(app.getHttpServer())
        .get('/credits/packages')
        .expect(200);

      const packageTier = packagesResponse.body[0];

      // Get initial balance
      const initialAuthor = await prisma.authorProfile.findUnique({
        where: { id: authorProfileId },
      });

      const sessionId = `cs_test_idempotency_${Date.now()}`;

      const webhookPayload = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: sessionId,
            metadata: {
              authorProfileId,
              packageTierId: packageTier.id,
            },
            amount_total: packageTier.price * 100,
            currency: 'usd',
            payment_status: 'paid',
          },
        },
      };

      // Send webhook first time
      await request(app.getHttpServer())
        .post('/webhooks/stripe')
        .send(webhookPayload)
        .expect(200);

      // Send same webhook again (duplicate)
      await request(app.getHttpServer())
        .post('/webhooks/stripe')
        .send(webhookPayload)
        .expect(200);

      // Credits should only be added once
      const finalAuthor = await prisma.authorProfile.findUnique({
        where: { id: authorProfileId },
      });

      const expectedCredits = (initialAuthor?.availableCredits || 0) + packageTier.credits;
      expect(finalAuthor?.availableCredits).toBe(expectedCredits);

      // There should only be one transaction
      const transactions = await prisma.creditTransaction.findMany({
        where: {
          authorProfileId,
          notes: {
            contains: sessionId,
          },
        },
      });

      expect(transactions.length).toBe(1);
    });

    it('should reject webhook with missing metadata', async () => {
      const webhookPayload = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: `cs_test_${Date.now()}`,
            metadata: {
              // Missing authorProfileId and packageTierId
            },
            amount_total: 9900,
            currency: 'usd',
            payment_status: 'paid',
          },
        },
      };

      await request(app.getHttpServer())
        .post('/webhooks/stripe')
        .send(webhookPayload)
        .expect(400);
    });

    it('should handle payment failed webhook', async () => {
      const webhookPayload = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: `pi_test_${Date.now()}`,
            metadata: {
              authorProfileId,
            },
            amount: 9900,
            currency: 'usd',
            last_payment_error: {
              message: 'Your card was declined.',
            },
          },
        },
      };

      await request(app.getHttpServer())
        .post('/webhooks/stripe')
        .send(webhookPayload)
        .expect(200);

      // Verify no credits were added
      // Check that an email notification was sent (if applicable)
    });
  });

  describe('Credit Purchase History', () => {
    beforeAll(async () => {
      // Create a test purchase
      const packagesResponse = await request(app.getHttpServer())
        .get('/credits/packages')
        .expect(200);

      const packageTier = packagesResponse.body[0];

      await prisma.creditPurchase.create({
        data: {
          authorProfileId,
          packageTierId: packageTier.id,
          amountPaid: packageTier.price,
          credits: packageTier.credits,
          currency: 'USD',
          validityDays: 90,
          activationWindowExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          stripePaymentId: 'pi_test_history',
          paymentStatus: 'COMPLETED',
        },
      });
    });

    it('should get author credit purchase history', async () => {
      const response = await request(app.getHttpServer())
        .get('/credits/purchases')
        .set('Authorization', `Bearer ${authorToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const purchase = response.body[0];
      expect(purchase).toHaveProperty('id');
      expect(purchase).toHaveProperty('amount');
      expect(purchase).toHaveProperty('credits');
      expect(purchase).toHaveProperty('status');
      expect(purchase).toHaveProperty('createdAt');
    });

    it('should reject unauthenticated request for purchase history', async () => {
      await request(app.getHttpServer())
        .get('/credits/purchases')
        .expect(401);
    });
  });

  describe('Credit Balance', () => {
    it('should get author current credit balance', async () => {
      const response = await request(app.getHttpServer())
        .get('/credits/balance')
        .set('Authorization', `Bearer ${authorToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('availableCredits');
      expect(response.body).toHaveProperty('allocatedCredits');
      expect(response.body).toHaveProperty('totalPurchased');
      expect(typeof response.body.availableCredits).toBe('number');
    });

    it('should reject non-author requests for credit balance', async () => {
      // Register a reader
      const readerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'reader-credit@test.com',
          password: 'Test123!@#',
          name: 'Reader Test',
          role: UserRole.READER,
        });

      await request(app.getHttpServer())
        .get('/credits/balance')
        .set('Authorization', `Bearer ${readerResponse.body.accessToken}`)
        .expect(403);
    });
  });
});
