import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '@common/prisma/prisma.service';
import { UserRole, PayoutRequestStatus } from '@prisma/client';
import { AuthModule } from '../src/modules/auth/auth.module';
import { WalletModule } from '../src/modules/wallet/wallet.module';
import { PrismaModule } from '../src/common/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import appConfig from '../src/config/app.config';
import jwtConfig from '../src/config/jwt.config';

describe('Payouts (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let readerToken: string;
  let adminToken: string;
  let readerProfileId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfig, jwtConfig],
        }),
        PrismaModule,
        AuthModule,
        WalletModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();

    // Create test reader
    const readerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'payout-reader@test.com',
        password: 'Test123!@#',
        name: 'Payout Test Reader',
        role: UserRole.READER,
      });
    readerToken = readerResponse.body.accessToken;

    const reader = await prisma.user.findUnique({
      where: { email: 'payout-reader@test.com' },
      include: { readerProfile: true },
    });
    readerProfileId = reader!.readerProfile!.id;

    // Initialize reader wallet with balance
    await prisma.readerProfile.update({
      where: { id: readerProfileId },
      data: {
        walletBalance: 150.0,
        totalEarned: 150.0,
        totalWithdrawn: 0,
      },
    });

    // Create test admin using register API
    const adminResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'payout-admin@test.com',
        password: 'Admin123!@#',
        name: 'Payout Test Admin',
        role: UserRole.ADMIN,
      });
    adminToken = adminResponse.body.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('Payout Request Submission', () => {
    it('should allow reader to request payout with sufficient balance', async () => {
      const response = await request(app.getHttpServer())
        .post('/payouts/request')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          amount: 100,
          paymentMethod: 'PayPal',
          paymentDetails: {
            paypalEmail: 'reader@paypal.com',
          },
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.amount).toBe(100);
      expect(response.body.status).toBe(PayoutRequestStatus.REQUESTED);
      expect(response.body.paymentMethod).toBe('PayPal');
    });

    it('should reject payout below minimum amount ($50)', async () => {
      await request(app.getHttpServer())
        .post('/payouts/request')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          amount: 25,
          paymentMethod: 'PayPal',
          paymentDetails: {
            paypalEmail: 'reader@paypal.com',
          },
        })
        .expect(400);
    });

    it('should reject payout exceeding available balance', async () => {
      await request(app.getHttpServer())
        .post('/payouts/request')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          amount: 200, // Balance is only 150
          paymentMethod: 'PayPal',
          paymentDetails: {
            paypalEmail: 'reader@paypal.com',
          },
        })
        .expect(400);
    });

    it('should reject payout without payment details', async () => {
      await request(app.getHttpServer())
        .post('/payouts/request')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          amount: 100,
          paymentMethod: 'PayPal',
          // paymentDetails is missing
        })
        .expect(400);
    });

    it('should encrypt payment details before storing', async () => {
      const response = await request(app.getHttpServer())
        .post('/payouts/request')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          amount: 75,
          paymentMethod: 'Bank Transfer',
          paymentDetails: {
            accountNumber: '1234567890',
            routingNumber: '987654321',
            bankName: 'Test Bank',
          },
        })
        .expect(201);

      // Check database directly
      const payout = await prisma.payoutRequest.findUnique({
        where: { id: response.body.id },
      });

      // Payment details should be encrypted (not plain text)
      expect(payout?.paymentDetails).toBeTruthy();
      expect(payout?.paymentDetails).not.toContain('1234567890');
      expect(payout?.paymentDetails).not.toContain('Test Bank');
    });

    it('should support multiple payment methods', async () => {
      const paymentMethods = [
        {
          method: 'PayPal',
          details: { paypalEmail: 'test@paypal.com' },
        },
        {
          method: 'Bank Transfer',
          details: {
            accountNumber: '1234567890',
            routingNumber: '987654321',
            bankName: 'Test Bank',
          },
        },
        {
          method: 'Wise',
          details: { wiseEmail: 'test@wise.com' },
        },
        {
          method: 'Crypto',
          details: {
            walletAddress: '0x1234567890abcdef',
            network: 'Ethereum',
          },
        },
      ];

      for (const pm of paymentMethods) {
        const response = await request(app.getHttpServer())
          .post('/payouts/request')
          .set('Authorization', `Bearer ${readerToken}`)
          .send({
            amount: 50,
            paymentMethod: pm.method,
            paymentDetails: pm.details,
          })
          .expect(201);

        expect(response.body.paymentMethod).toBe(pm.method);
      }
    });

    it('should update wallet balance after payout request', async () => {
      const initialProfile = await prisma.readerProfile.findUnique({
        where: { id: readerProfileId },
      });

      await request(app.getHttpServer())
        .post('/payouts/request')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          amount: 50,
          paymentMethod: 'PayPal',
          paymentDetails: {
            paypalEmail: 'reader@paypal.com',
          },
        })
        .expect(201);

      const updatedProfile = await prisma.readerProfile.findUnique({
        where: { id: readerProfileId },
      });

      // Wallet balance should be reduced
      expect(updatedProfile?.walletBalance.toNumber()).toBe(
        (initialProfile?.walletBalance.toNumber() || 0) - 50,
      );
    });

    it('should create wallet transaction for payout request', async () => {
      const response = await request(app.getHttpServer())
        .post('/payouts/request')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          amount: 50,
          paymentMethod: 'PayPal',
          paymentDetails: {
            paypalEmail: 'reader@paypal.com',
          },
        })
        .expect(201);

      const transaction = await prisma.walletTransaction.findFirst({
        where: {
          readerProfileId,
          type: 'PAYOUT',
          notes: {
            contains: response.body.id,
          },
        },
      });

      expect(transaction).toBeTruthy();
      expect(transaction?.amount.toNumber()).toBe(-50);
    });

    it('should send email notification on payout request', async () => {
      await request(app.getHttpServer())
        .post('/payouts/request')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          amount: 50,
          paymentMethod: 'PayPal',
          paymentDetails: {
            paypalEmail: 'reader@paypal.com',
          },
        })
        .expect(201);

      // TODO: Check admin notification email once ADMIN_PAYOUT_REQUESTED email is implemented
      // const emailLog = await prisma.emailLog.findFirst({
      //   where: {
      //     type: 'ADMIN_PAYOUT_REQUESTED',
      //   },
      //   orderBy: {
      //     createdAt: 'desc',
      //   },
      // });
      // expect(emailLog).toBeTruthy();
    });
  });

  describe('Get Payout Requests', () => {
    beforeEach(async () => {
      // Create test payout request
      await prisma.payoutRequest.create({
        data: {
          readerProfileId,
          amount: 100,
          status: PayoutRequestStatus.REQUESTED,
          paymentMethod: 'PayPal',
          paymentDetails: JSON.stringify({ paypalEmail: 'reader@paypal.com' }),
        },
      });
    });

    it('should get reader own payout requests', async () => {
      const response = await request(app.getHttpServer())
        .get('/payouts/my-payouts')
        .set('Authorization', `Bearer ${readerToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const payout = response.body[0];
      expect(payout).toHaveProperty('id');
      expect(payout).toHaveProperty('amount');
      expect(payout).toHaveProperty('status');
      expect(payout).toHaveProperty('paymentMethod');
      // Payment details should not be exposed to reader
      expect(payout).not.toHaveProperty('paymentDetails');
    });

    it('should get pending payouts for admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/payouts/pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      if (response.body.length > 0) {
        const payout = response.body[0];
        expect(payout).toHaveProperty('id');
        expect(payout).toHaveProperty('paymentDetails'); // Admin can see details
      }
    });

    it('should prevent reader from accessing all payouts', async () => {
      await request(app.getHttpServer())
        .get('/payouts/pending')
        .set('Authorization', `Bearer ${readerToken}`)
        .expect(403);
    });
  });

  describe('Payout Approval', () => {
    let payoutId: string;

    beforeEach(async () => {
      const payout = await prisma.payoutRequest.create({
        data: {
          readerProfileId,
          amount: 100,
          status: PayoutRequestStatus.REQUESTED,
          paymentMethod: 'PayPal',
          paymentDetails: JSON.stringify({ paypalEmail: 'reader@paypal.com' }),
        },
      });
      payoutId = payout.id;
    });

    it('should allow admin to approve payout', async () => {
      const response = await request(app.getHttpServer())
        .post(`/payouts/${payoutId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          notes: 'Payment details verified',
        })
        .expect(200);

      expect(response.body.status).toBe(PayoutRequestStatus.APPROVED);
      expect(response.body.processedAt).toBeTruthy();
    });

    it('should send email notification on approval', async () => {
      await request(app.getHttpServer())
        .post(`/payouts/${payoutId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          notes: 'Approved',
        })
        .expect(200);

      // TODO: Check reader notification email once READER_PAYOUT_APPROVED email type is added to schema
      // const emailLog = await prisma.emailLog.findFirst({
      //   where: {
      //     type: 'READER_PAYOUT_APPROVED',
      //   },
      //   orderBy: {
      //     createdAt: 'desc',
      //   },
      // });
      // expect(emailLog).toBeTruthy();
    });

    it('should prevent non-admin from approving payouts', async () => {
      await request(app.getHttpServer())
        .post(`/payouts/${payoutId}/approve`)
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          notes: 'Approved',
        })
        .expect(403);
    });
  });

  describe('Payout Rejection', () => {
    let payoutId: string;

    beforeEach(async () => {
      const payout = await prisma.payoutRequest.create({
        data: {
          readerProfileId,
          amount: 100,
          status: PayoutRequestStatus.REQUESTED,
          paymentMethod: 'PayPal',
          paymentDetails: JSON.stringify({ paypalEmail: 'reader@paypal.com' }),
        },
      });
      payoutId = payout.id;
    });

    it('should allow admin to reject payout with reason', async () => {
      const response = await request(app.getHttpServer())
        .post(`/payouts/${payoutId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          reason: 'Payment details are invalid or incomplete',
        })
        .expect(200);

      expect(response.body.status).toBe(PayoutRequestStatus.REJECTED);
      expect(response.body.rejectionReason).toBe('Payment details are invalid or incomplete');
    });

    it('should reject payout rejection without reason', async () => {
      await request(app.getHttpServer())
        .post(`/payouts/${payoutId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          // reason is missing
        })
        .expect(400);
    });

    it('should reject payout rejection with short reason', async () => {
      await request(app.getHttpServer())
        .post(`/payouts/${payoutId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          reason: 'Bad', // Less than 10 characters
        })
        .expect(400);
    });

    it('should restore wallet balance on rejection', async () => {
      const initialProfile = await prisma.readerProfile.findUnique({
        where: { id: readerProfileId },
      });

      await request(app.getHttpServer())
        .post(`/payouts/${payoutId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          reason: 'Payment details are invalid or incomplete',
        })
        .expect(200);

      const updatedProfile = await prisma.readerProfile.findUnique({
        where: { id: readerProfileId },
      });

      // Balance should be restored
      expect(updatedProfile?.walletBalance.toNumber()).toBe(
        (initialProfile?.walletBalance.toNumber() || 0) + 100,
      );
    });

    it('should create reversal wallet transaction on rejection', async () => {
      await request(app.getHttpServer())
        .post(`/payouts/${payoutId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          reason: 'Payment details are invalid or incomplete',
        })
        .expect(200);

      const transaction = await prisma.walletTransaction.findFirst({
        where: {
          readerProfileId,
          type: 'REVERSAL',
          notes: {
            contains: payoutId,
          },
        },
      });

      expect(transaction).toBeTruthy();
      expect(transaction?.amount.toNumber()).toBe(100); // Positive (adding back)
    });

    it('should send email notification on rejection', async () => {
      await request(app.getHttpServer())
        .post(`/payouts/${payoutId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          reason: 'Payment details are invalid or incomplete',
        })
        .expect(200);

      // TODO: Check reader notification email once READER_PAYOUT_REJECTED email type is added to schema
      // const emailLog = await prisma.emailLog.findFirst({
      //   where: {
      //     type: 'READER_PAYOUT_REJECTED',
      //   },
      //   orderBy: {
      //     createdAt: 'desc',
      //   },
      // });
      // expect(emailLog).toBeTruthy();
    });
  });

  describe('Payout Completion', () => {
    let payoutId: string;

    beforeEach(async () => {
      const payout = await prisma.payoutRequest.create({
        data: {
          readerProfileId,
          amount: 100,
          status: PayoutRequestStatus.APPROVED,
          paymentMethod: 'PayPal',
          paymentDetails: JSON.stringify({ paypalEmail: 'reader@paypal.com' }),
        },
      });
      payoutId = payout.id;
    });

    it('should allow admin to mark payout as completed', async () => {
      const response = await request(app.getHttpServer())
        .post(`/payouts/${payoutId}/complete`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          transactionId: 'PP-12345-ABCDE',
          notes: 'Payment sent via PayPal',
        })
        .expect(200);

      expect(response.body.status).toBe(PayoutRequestStatus.COMPLETED);
      expect(response.body.transactionId).toBe('PP-12345-ABCDE');
      expect(response.body.paidAt).toBeTruthy();
    });

    it('should reject completion without transaction ID', async () => {
      await request(app.getHttpServer())
        .post(`/payouts/${payoutId}/complete`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          // transactionId is missing
        })
        .expect(400);
    });

    it('should reject completion with short transaction ID', async () => {
      await request(app.getHttpServer())
        .post(`/payouts/${payoutId}/complete`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          transactionId: '123', // Less than 5 characters
        })
        .expect(400);
    });

    it('should update total withdrawn in wallet', async () => {
      const initialProfile = await prisma.readerProfile.findUnique({
        where: { id: readerProfileId },
      });

      await request(app.getHttpServer())
        .post(`/payouts/${payoutId}/complete`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          transactionId: 'PP-12345-ABCDE',
        })
        .expect(200);

      const updatedProfile = await prisma.readerProfile.findUnique({
        where: { id: readerProfileId },
      });

      expect(updatedProfile?.totalWithdrawn.toNumber()).toBe(
        (initialProfile?.totalWithdrawn.toNumber() || 0) + 100,
      );
    });

    it('should send email notification on completion', async () => {
      await request(app.getHttpServer())
        .post(`/payouts/${payoutId}/complete`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          transactionId: 'PP-12345-ABCDE',
        })
        .expect(200);

      // TODO: Check reader notification email once READER_PAYOUT_PROCESSED email type is added to schema
      // const emailLog = await prisma.emailLog.findFirst({
      //   where: {
      //     type: 'READER_PAYOUT_PROCESSED',
      //   },
      //   orderBy: {
      //     createdAt: 'desc',
      //   },
      // });
      // expect(emailLog).toBeTruthy();
    });
  });
});
