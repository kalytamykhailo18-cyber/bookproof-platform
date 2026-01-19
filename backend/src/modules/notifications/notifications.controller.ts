import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import {
  NotificationListResponseDto,
  GetNotificationsDto,
  MarkAsReadDto,
  NotificationSettingsDto,
  UpdateNotificationSettingsDto,
} from './dto/notification.dto';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get notifications for current user' })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
    type: NotificationListResponseDto,
  })
  async getNotifications(
    @Req() req: Request,
    @Query() dto: GetNotificationsDto,
  ): Promise<NotificationListResponseDto> {
    return this.notificationsService.getNotifications(req.user!.id, dto);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved successfully',
  })
  async getUnreadCount(@Req() req: Request): Promise<{ count: number }> {
    const count = await this.notificationsService.getUnreadCount(req.user!.id);
    return { count };
  }

  @Post('mark-read')
  @ApiOperation({ summary: 'Mark notifications as read' })
  @ApiResponse({
    status: 200,
    description: 'Notifications marked as read',
  })
  async markAsRead(
    @Req() req: Request,
    @Body() dto: MarkAsReadDto,
  ): Promise<{ updated: number }> {
    const updated = await this.notificationsService.markAsRead(
      req.user!.id,
      dto.notificationIds,
    );
    return { updated };
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
  })
  async markAllAsRead(@Req() req: Request): Promise<{ updated: number }> {
    const updated = await this.notificationsService.markAllAsRead(req.user!.id);
    return { updated };
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get notification settings' })
  @ApiResponse({
    status: 200,
    description: 'Settings retrieved successfully',
    type: NotificationSettingsDto,
  })
  async getSettings(@Req() req: Request): Promise<NotificationSettingsDto> {
    return this.notificationsService.getSettings(req.user!.id);
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update notification settings' })
  @ApiResponse({
    status: 200,
    description: 'Settings updated successfully',
    type: NotificationSettingsDto,
  })
  async updateSettings(
    @Req() req: Request,
    @Body() dto: UpdateNotificationSettingsDto,
  ): Promise<NotificationSettingsDto> {
    return this.notificationsService.updateSettings(req.user!.id, dto);
  }
}
