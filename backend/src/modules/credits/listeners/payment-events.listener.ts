import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PaymentSuccessEvent } from '@modules/payments/events/payment-events';
import { CreditsService } from '../credits.service';

/**
 * Payment Events Listener
 *
 * Listens to payment events emitted by PaymentsModule.
 * This event-driven architecture prevents circular dependencies.
 */
@Injectable()
export class PaymentEventsListener {
  private readonly logger = new Logger(PaymentEventsListener.name);

  constructor(private readonly creditsService: CreditsService) {}

  /**
   * Handle successful payment event
   */
  @OnEvent('payment.success')
  async handlePaymentSuccess(event: PaymentSuccessEvent) {
    this.logger.log(`Received payment.success event for session: ${event.stripeSessionId}`);

    try {
      // Process the payment by calling CreditsService
      await this.creditsService.processSuccessfulPayment(event.stripeSessionId);
      this.logger.log(`Successfully processed payment for session: ${event.stripeSessionId}`);
    } catch (error) {
      this.logger.error(
        `Failed to process payment for session ${event.stripeSessionId}: ${error.message}`,
        error.stack,
      );
      // Note: Error is logged but not thrown to prevent webhook failures
      // The payment was successful in Stripe, so we don't want to return an error to Stripe
    }
  }
}
