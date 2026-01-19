import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RealtimeService } from './realtime.service';
import { Subscription } from 'rxjs';

@ApiTags('Realtime')
@Controller('realtime')
export class RealtimeController {
  constructor(private readonly realtimeService: RealtimeService) {}

  /**
   * Server-Sent Events endpoint for real-time updates
   *
   * Clients connect to this endpoint to receive real-time updates:
   * - Dashboard statistics updates
   * - Campaign progress updates
   * - Queue status changes
   * - Notifications
   *
   * Events are filtered based on user ID and role to ensure
   * users only receive relevant updates.
   */
  @Get('events')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Subscribe to real-time events via Server-Sent Events (SSE)',
    description:
      'Connect to receive real-time updates for dashboard, campaigns, queue, and notifications. Events are filtered by user and role.',
  })
  @ApiResponse({
    status: 200,
    description: 'SSE connection established',
  })
  async subscribeToEvents(@Req() req: Request, @Res() res: Response) {
    const userId = req.user!.id;
    const role = req.user!.role;

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering for nginx
    res.flushHeaders();

    // Send initial connection confirmation
    res.write(
      `data: ${JSON.stringify({
        type: 'connected',
        payload: { message: 'SSE connection established' },
        timestamp: new Date().toISOString(),
      })}\n\n`,
    );

    // Subscribe to event stream
    let subscription: Subscription | null = null;

    subscription = this.realtimeService.getEventStream(userId, role).subscribe({
      next: (event) => {
        res.write(this.realtimeService.formatSSEMessage(event));
      },
      error: (err) => {
        console.error('SSE stream error:', err);
        res.end();
      },
    });

    // Send heartbeat every 30 seconds to keep connection alive
    const heartbeatInterval = setInterval(() => {
      res.write(
        `data: ${JSON.stringify({
          type: 'heartbeat',
          payload: {},
          timestamp: new Date().toISOString(),
        })}\n\n`,
      );
    }, 30000);

    // Clean up on client disconnect
    req.on('close', () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      clearInterval(heartbeatInterval);
    });
  }
}
