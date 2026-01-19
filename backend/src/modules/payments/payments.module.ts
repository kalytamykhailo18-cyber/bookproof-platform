import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { StripePaymentsService } from './services/stripe-payments.service';
import { StripeSubscriptionsService } from './services/stripe-subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { KeywordsModule } from '../keywords/keywords.module';

/**
 * Payments Module
 *
 * Handles Stripe payment processing for credit purchases and subscriptions.
 * Uses EventEmitter pattern to notify other modules (like CreditsModule) of payment events.
 * This prevents circular dependencies.
 */
@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    EventEmitterModule, // For event-driven architecture
    EmailModule, // For sending welcome emails on custom package payment
    forwardRef(() => KeywordsModule), // For keyword research payment handling
  ],
  controllers: [PaymentsController, SubscriptionsController],
  providers: [PaymentsService, StripePaymentsService, StripeSubscriptionsService],
  exports: [PaymentsService, StripePaymentsService, StripeSubscriptionsService],
})
export class PaymentsModule {}
