import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { RealtimeService, RealtimeEventType } from './realtime.service';

/**
 * Gateway that bridges internal application events to realtime broadcasts
 *
 * This service listens for internal events (from EventEmitter2)
 * and broadcasts them to connected clients via the RealtimeService.
 */
@Injectable()
export class RealtimeGateway implements OnModuleInit {
  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly realtimeService: RealtimeService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  onModuleInit() {
    this.logger.log('Realtime gateway initialized');
  }

  /**
   * Handle review submission events
   * Broadcasts to admin dashboard and author
   */
  @OnEvent('review.submitted')
  handleReviewSubmitted(payload: { bookId: string; readerProfileId: string; reviewId: string }) {
    this.realtimeService.emit({
      type: RealtimeEventType.REVIEW_SUBMITTED,
      payload,
      role: 'ADMIN', // Notify admins
    });
  }

  /**
   * Handle review validation events
   */
  @OnEvent('review.validated')
  handleReviewValidated(payload: {
    bookId: string;
    reviewId: string;
    authorProfileId: string;
    status: string;
  }) {
    this.realtimeService.emitCampaignProgress(
      payload.bookId,
      { status: 'review_validated', reviewId: payload.reviewId },
      payload.authorProfileId,
    );
  }

  /**
   * Handle assignment status changes
   */
  @OnEvent('assignment.status_changed')
  handleAssignmentStatusChanged(payload: {
    assignmentId: string;
    bookId: string;
    readerId: string;
    newStatus: string;
  }) {
    // Notify the reader
    this.realtimeService.emit({
      type: RealtimeEventType.ASSIGNMENT_STATUS_CHANGED,
      payload,
      userId: payload.readerId,
    });

    // Update queue status for admins
    this.realtimeService.emitQueueUpdate(payload.bookId, {
      assignmentId: payload.assignmentId,
      status: payload.newStatus,
    });
  }

  /**
   * Handle campaign status updates
   */
  @OnEvent('campaign.status_changed')
  handleCampaignStatusChanged(payload: {
    bookId: string;
    authorProfileId: string;
    oldStatus: string;
    newStatus: string;
  }) {
    this.realtimeService.emit({
      type: RealtimeEventType.CAMPAIGN_UPDATED,
      payload,
    });
  }

  /**
   * Handle materials released to reader
   */
  @OnEvent('materials.released')
  handleMaterialsReleased(payload: { assignmentId: string; readerId: string; bookTitle: string }) {
    this.realtimeService.emitNotification(payload.readerId, {
      title: 'Materials Available',
      message: `Your materials for "${payload.bookTitle}" are now available!`,
      type: 'success',
    });
  }

  /**
   * Handle deadline reminder
   */
  @OnEvent('deadline.reminder')
  handleDeadlineReminder(payload: {
    assignmentId: string;
    readerId: string;
    bookTitle: string;
    hoursRemaining: number;
  }) {
    this.realtimeService.emitNotification(payload.readerId, {
      title: 'Deadline Reminder',
      message: `You have ${payload.hoursRemaining} hours to submit your review for "${payload.bookTitle}"`,
      type: 'warning',
    });
  }

  /**
   * Handle credit balance changes
   */
  @OnEvent('credits.updated')
  handleCreditsUpdated(payload: { authorProfileId: string; newBalance: number; change: number }) {
    this.realtimeService.emit({
      type: RealtimeEventType.NOTIFICATION,
      payload: {
        title: 'Credits Updated',
        message: `Your credit balance has been updated. New balance: ${payload.newBalance}`,
        type: 'info',
      },
      userId: payload.authorProfileId,
    });
  }

  /**
   * Handle payout request status changes
   */
  @OnEvent('payout.status_changed')
  handlePayoutStatusChanged(payload: {
    payoutId: string;
    readerProfileId: string;
    newStatus: string;
    amount: number;
  }) {
    const statusMessages: Record<string, string> = {
      APPROVED: 'Your payout request has been approved!',
      PROCESSING: 'Your payout is being processed.',
      COMPLETED: `Your payout of $${payload.amount} has been completed!`,
      REJECTED: 'Your payout request has been rejected.',
    };

    this.realtimeService.emitNotification(payload.readerProfileId, {
      title: 'Payout Update',
      message: statusMessages[payload.newStatus] || `Payout status: ${payload.newStatus}`,
      type: payload.newStatus === 'REJECTED' ? 'error' : 'success',
    });
  }

  /**
   * Handle admin alerts (e.g., high rejection rate, campaign issues)
   */
  @OnEvent('admin.alert')
  handleAdminAlert(payload: { title: string; message: string; severity: 'info' | 'warning' | 'error' }) {
    this.realtimeService.emitAdminAlert(payload);
  }
}
