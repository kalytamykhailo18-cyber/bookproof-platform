import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Subject, Observable, filter, map } from 'rxjs';

/**
 * Event types for real-time updates
 * These events are pushed to connected clients via SSE
 */
export enum RealtimeEventType {
  // Dashboard events
  DASHBOARD_UPDATED = 'dashboard.updated',
  CAMPAIGN_UPDATED = 'campaign.updated',
  CAMPAIGN_PROGRESS = 'campaign.progress',

  // Queue events
  QUEUE_UPDATED = 'queue.updated',
  ASSIGNMENT_STATUS_CHANGED = 'assignment.status_changed',

  // Review events
  REVIEW_SUBMITTED = 'review.submitted',
  REVIEW_VALIDATED = 'review.validated',

  // Notification events
  NOTIFICATION = 'notification',

  // Admin events
  ADMIN_ALERT = 'admin.alert',
}

export interface RealtimeEvent {
  type: RealtimeEventType;
  payload: any;
  userId?: string; // If set, only send to this user
  role?: string; // If set, only send to users with this role
  timestamp: Date;
}

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  private readonly eventSubject = new Subject<RealtimeEvent>();

  constructor(private eventEmitter: EventEmitter2) {
    // Listen to internal events and broadcast them
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Listen for payment events
    this.eventEmitter.on('payment.success', (data) => {
      this.emit({
        type: RealtimeEventType.NOTIFICATION,
        payload: {
          title: 'Payment Successful',
          message: 'Your payment has been processed',
          ...data,
        },
        userId: data.userId,
        timestamp: new Date(),
      });
    });

    // Listen for review events
    this.eventEmitter.on('review.submitted', (data) => {
      this.emit({
        type: RealtimeEventType.REVIEW_SUBMITTED,
        payload: data,
        timestamp: new Date(),
      });
    });

    // Listen for assignment status changes
    this.eventEmitter.on('assignment.status_changed', (data) => {
      this.emit({
        type: RealtimeEventType.ASSIGNMENT_STATUS_CHANGED,
        payload: data,
        userId: data.userId,
        timestamp: new Date(),
      });
    });

    // Listen for campaign updates
    this.eventEmitter.on('campaign.updated', (data) => {
      this.emit({
        type: RealtimeEventType.CAMPAIGN_UPDATED,
        payload: data,
        timestamp: new Date(),
      });
    });
  }

  /**
   * Emit a real-time event to connected clients
   */
  emit(event: Omit<RealtimeEvent, 'timestamp'> & { timestamp?: Date }) {
    const fullEvent: RealtimeEvent = {
      ...event,
      timestamp: event.timestamp || new Date(),
    };
    this.eventSubject.next(fullEvent);
    this.logger.debug(`Emitted realtime event: ${event.type}`);
  }

  /**
   * Emit a dashboard update event
   */
  emitDashboardUpdate(dashboardType: string, data: any) {
    this.emit({
      type: RealtimeEventType.DASHBOARD_UPDATED,
      payload: { dashboardType, data },
    });
  }

  /**
   * Emit a campaign progress update
   */
  emitCampaignProgress(campaignId: string, progress: any, authorId?: string) {
    this.emit({
      type: RealtimeEventType.CAMPAIGN_PROGRESS,
      payload: { campaignId, ...progress },
      userId: authorId,
    });
  }

  /**
   * Emit a queue status update
   */
  emitQueueUpdate(campaignId: string, queueData: any) {
    this.emit({
      type: RealtimeEventType.QUEUE_UPDATED,
      payload: { campaignId, ...queueData },
    });
  }

  /**
   * Emit a notification to a specific user
   */
  emitNotification(userId: string, notification: { title: string; message: string; type?: string }) {
    this.emit({
      type: RealtimeEventType.NOTIFICATION,
      payload: notification,
      userId,
    });
  }

  /**
   * Emit an admin alert
   */
  emitAdminAlert(alert: { title: string; message: string; severity: 'info' | 'warning' | 'error' }) {
    this.emit({
      type: RealtimeEventType.ADMIN_ALERT,
      payload: alert,
      role: 'ADMIN',
    });
  }

  /**
   * Get an observable stream of events for a specific user
   * Used by SSE controller to stream events to clients
   */
  getEventStream(userId: string, role: string): Observable<RealtimeEvent> {
    return this.eventSubject.asObservable().pipe(
      filter((event) => {
        // Global events (no userId and no role restriction)
        if (!event.userId && !event.role) {
          return true;
        }
        // User-specific events
        if (event.userId && event.userId === userId) {
          return true;
        }
        // Role-specific events
        if (event.role && event.role === role) {
          return true;
        }
        return false;
      }),
    );
  }

  /**
   * Format event for SSE response
   */
  formatSSEMessage(event: RealtimeEvent): string {
    return `data: ${JSON.stringify({
      type: event.type,
      payload: event.payload,
      timestamp: event.timestamp.toISOString(),
    })}\n\n`;
  }
}
