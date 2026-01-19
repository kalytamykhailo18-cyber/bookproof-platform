/**
 * Payment Events
 *
 * Event-driven architecture to prevent circular dependencies.
 * PaymentsModule emits these events, and other modules (like CreditsModule) listen to them.
 */

export class PaymentSuccessEvent {
  constructor(
    public readonly creditPurchaseId: string,
    public readonly authorProfileId: string,
    public readonly stripeSessionId: string,
    public readonly amountPaid: number,
    public readonly credits: number,
  ) {}
}

export class PaymentFailedEvent {
  constructor(
    public readonly creditPurchaseId: string,
    public readonly authorProfileId: string,
    public readonly reason: string,
  ) {}
}

export class SubscriptionRenewedEvent {
  constructor(
    public readonly subscriptionId: string,
    public readonly authorProfileId: string,
    public readonly credits: number,
  ) {}
}

/**
 * Refund Processed Event
 * Emitted when a refund is processed via Stripe webhook
 */
export class RefundProcessedEvent {
  constructor(
    public readonly refundId: string,
    public readonly chargeId: string,
    public readonly paymentIntentId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly creditPurchaseId: string | null,
    public readonly authorProfileId: string | null,
    public readonly reason: string | null,
  ) {}
}

/**
 * Dispute Created Event
 * Emitted when a payment dispute is created via Stripe webhook
 */
export class DisputeCreatedEvent {
  constructor(
    public readonly disputeId: string,
    public readonly chargeId: string,
    public readonly paymentIntentId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly reason: string,
    public readonly status: string,
    public readonly evidenceDueBy: Date,
    public readonly creditPurchaseId: string | null,
    public readonly authorProfileId: string | null,
  ) {}
}

/**
 * Dispute Updated Event
 * Emitted when a dispute status changes
 */
export class DisputeUpdatedEvent {
  constructor(
    public readonly disputeId: string,
    public readonly status: string,
    public readonly previousStatus: string,
    public readonly creditPurchaseId: string | null,
    public readonly authorProfileId: string | null,
  ) {}
}
