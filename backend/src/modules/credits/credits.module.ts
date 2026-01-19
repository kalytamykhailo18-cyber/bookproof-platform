import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CreditsController } from './credits.controller';
import { CreditsService } from './credits.service';
import { PrismaModule } from '@common/prisma/prisma.module';
import { CommissionModule } from '@modules/affiliates/commission.module';
import { EmailModule } from '@modules/email/email.module';
import { PaymentEventsListener } from './listeners/payment-events.listener';

/**
 * Credits Module
 *
 * Handles credit packages, purchases, and allocations.
 * Imports CommissionModule (not AffiliatesModule) to prevent circular dependency.
 * Listens to payment events from PaymentsModule via EventEmitter (event-driven architecture).
 *
 * CommissionModule provides CommissionService for affiliate commission tracking.
 * EmailModule provides email sending for purchase receipts.
 */
@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    CommissionModule, // Direct import - no forwardRef needed!
    EmailModule, // For sending purchase receipt emails
    EventEmitterModule, // For listening to payment events
  ],
  controllers: [CreditsController],
  providers: [
    CreditsService,
    PaymentEventsListener, // Listens to payment.success events
  ],
  exports: [CreditsService],
})
export class CreditsModule {}
