import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { QueueService } from './queue.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApplyToCampaignDto } from './dto/apply-to-campaign.dto';
import { AssignmentResponseDto } from './dto/assignment-response.dto';
import { AvailableCampaignDto } from './dto/available-campaigns-response.dto';

@ApiTags('queue')
@Controller('queue')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get('available-campaigns')
  @Roles(UserRole.READER)
  @ApiOperation({ summary: 'Get all available campaigns for readers to apply' })
  @ApiResponse({
    status: 200,
    description: 'Available campaigns retrieved successfully',
    type: [AvailableCampaignDto],
  })
  async getAvailableCampaigns(@Req() req: Request): Promise<AvailableCampaignDto[]> {
    return this.queueService.getAvailableCampaigns(req.user!.userId!);
  }

  @Post('apply')
  @Roles(UserRole.READER)
  @ApiOperation({
    summary: 'Apply to a campaign (enter queue in WAITING status)',
    description:
      'Reader applies to review a book. Assignment starts in WAITING status. Materials will be released ONLY when scheduled by weekly distribution job.',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully applied to campaign',
    type: AssignmentResponseDto,
  })
  async applyToCampaign(
    @Req() req: Request,
    @Body() applyToCampaignDto: ApplyToCampaignDto,
  ): Promise<AssignmentResponseDto> {
    return this.queueService.applyToCampaign(req.user!.userId!, applyToCampaignDto);
  }

  @Get('my-assignments')
  @Roles(UserRole.READER)
  @ApiOperation({ summary: 'Get all my assignments with status and details' })
  @ApiResponse({
    status: 200,
    description: 'Assignments retrieved successfully',
    type: [AssignmentResponseDto],
  })
  async getMyAssignments(@Req() req: Request): Promise<AssignmentResponseDto[]> {
    return this.queueService.getMyAssignments(req.user!.userId!);
  }

  @Get('assignments/:assignmentId')
  @Roles(UserRole.READER)
  @ApiOperation({ summary: 'Get assignment details by ID' })
  @ApiResponse({
    status: 200,
    description: 'Assignment details retrieved successfully',
    type: AssignmentResponseDto,
  })
  async getAssignmentById(
    @Req() req: Request,
    @Param('assignmentId') assignmentId: string,
  ): Promise<AssignmentResponseDto> {
    return this.queueService.getAssignmentById(req.user!.userId!, assignmentId);
  }

  @Delete('assignments/:assignmentId/withdraw')
  @Roles(UserRole.READER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Withdraw from assignment (only if WAITING or SCHEDULED)',
    description:
      'Reader can withdraw from assignment before materials are released. Cannot withdraw after materials are released.',
  })
  @ApiResponse({
    status: 204,
    description: 'Successfully withdrawn from assignment',
  })
  async withdrawFromAssignment(
    @Req() req: Request,
    @Param('assignmentId') assignmentId: string,
  ): Promise<void> {
    return this.queueService.withdrawFromAssignment(req.user!.userId!, assignmentId);
  }

  @Post('assignments/:assignmentId/track-ebook-download')
  @Roles(UserRole.READER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Track ebook download and mark assignment as IN_PROGRESS',
    description: 'Tracks when reader downloads the ebook and updates status to IN_PROGRESS if currently APPROVED.',
  })
  @ApiResponse({
    status: 204,
    description: 'Ebook download tracked successfully',
  })
  async trackEbookDownload(
    @Req() req: Request,
    @Param('assignmentId') assignmentId: string,
  ): Promise<void> {
    return this.queueService.trackEbookDownload(req.user!.userId!, assignmentId);
  }

  @Post('assignments/:assignmentId/track-audiobook-access')
  @Roles(UserRole.READER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Track audiobook access and mark assignment as IN_PROGRESS',
    description: 'Tracks when reader first plays the audiobook and updates status to IN_PROGRESS if currently APPROVED.',
  })
  @ApiResponse({
    status: 204,
    description: 'Audiobook access tracked successfully',
  })
  async trackAudiobookAccess(
    @Req() req: Request,
    @Param('assignmentId') assignmentId: string,
  ): Promise<void> {
    return this.queueService.trackAudiobookAccess(req.user!.userId!, assignmentId);
  }

  /**
   * Secure audio streaming endpoint
   *
   * SECURITY: This endpoint implements all audiobook security requirements:
   * 1. Access restricted to logged-in readers only (JWT auth)
   * 2. Validates user owns the assignment
   * 3. Validates 7-day audiobook access window hasn't expired
   * 4. Validates assignment hasn't been completed/expired
   * 5. Streams audio without exposing the actual file URL
   * 6. Supports Range headers for seeking (required for audio players)
   *
   * Per requirements:
   * - Time-limited access window: 7 days after access granted
   * - Non-public audio links using temporary/signed URLs
   * - Access expires after 7-day window regardless of login status
   * - URLs cannot be shared with others (signed per user)
   */
  @Get('assignments/:assignmentId/stream-audio')
  @Roles(UserRole.READER)
  @ApiOperation({
    summary: 'Stream audiobook content securely',
    description:
      'Streams audiobook content directly without exposing the file URL. ' +
      'Validates user authorization, assignment ownership, and 7-day access window. ' +
      'Supports Range headers for seeking in audio players.',
  })
  @ApiHeader({
    name: 'Range',
    description: 'Byte range for partial content requests (e.g., bytes=0-1000)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Audio content streamed successfully',
  })
  @ApiResponse({
    status: 206,
    description: 'Partial audio content streamed (Range request)',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied - audiobook access has expired or assignment not approved',
  })
  async streamAudiobook(
    @Req() req: Request,
    @Res() res: Response,
    @Param('assignmentId') assignmentId: string,
    @Headers('range') range?: string,
  ): Promise<void> {
    return this.queueService.streamAudiobook(
      req.user!.userId!,
      assignmentId,
      res,
      range,
    );
  }
}
