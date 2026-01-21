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

  /**
   * Secure ebook streaming endpoint
   *
   * SECURITY: This endpoint implements all ebook security requirements (Section 11.2):
   * 1. Access restricted to logged-in readers only (JWT auth)
   * 2. Validates user owns the assignment
   * 3. Validates 72-hour deadline hasn't expired
   * 4. Validates assignment status is valid (APPROVED, IN_PROGRESS, SUBMITTED)
   * 5. Streams ebook without exposing the actual file URL
   * 6. Supports Range headers for large files
   *
   * Per requirements:
   * - Only granted readers can access
   * - URL signed with reader ID and expiration (via JWT)
   * - Expires when deadline passes (72 hours)
   * - Download allowed
   */
  @Get('assignments/:assignmentId/stream-ebook')
  @Roles(UserRole.READER)
  @ApiOperation({
    summary: 'Stream ebook content securely',
    description:
      'Streams ebook content directly without exposing the file URL. ' +
      'Validates user authorization, assignment ownership, and 72-hour deadline. ' +
      'Supports Range headers for large files. Download is allowed.',
  })
  @ApiHeader({
    name: 'Range',
    description: 'Byte range for partial content requests (e.g., bytes=0-1000)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Ebook content streamed successfully',
  })
  @ApiResponse({
    status: 206,
    description: 'Partial ebook content streamed (Range request)',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied - ebook access has expired or assignment not approved',
  })
  async streamEbook(
    @Req() req: Request,
    @Res() res: Response,
    @Param('assignmentId') assignmentId: string,
    @Headers('range') range?: string,
  ): Promise<void> {
    return this.queueService.streamEbook(
      req.user!.userId!,
      assignmentId,
      res,
      range,
    );
  }

  /**
   * Secure synopsis streaming endpoint
   *
   * SECURITY: This endpoint implements synopsis security requirements (Section 11.2):
   * 1. Access restricted to logged-in readers only (JWT auth)
   * 2. Validates user owns the assignment
   * 3. Validates materials have been released
   * 4. Validates assignment status is valid
   * 5. Streams synopsis without exposing the actual file URL
   * 6. Available for both ebook and audiobook formats
   *
   * Per requirements:
   * - Same as ebook (only granted readers)
   * - Available alongside main content
   * - Follows format-specific expiration rules
   */
  @Get('assignments/:assignmentId/stream-synopsis')
  @Roles(UserRole.READER)
  @ApiOperation({
    summary: 'Stream synopsis content securely',
    description:
      'Streams synopsis content directly without exposing the file URL. ' +
      'Validates user authorization and assignment ownership. ' +
      'Available for both ebook and audiobook formats.',
  })
  @ApiHeader({
    name: 'Range',
    description: 'Byte range for partial content requests (e.g., bytes=0-1000)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Synopsis content streamed successfully',
  })
  @ApiResponse({
    status: 206,
    description: 'Partial synopsis content streamed (Range request)',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied - synopsis access has expired or assignment not approved',
  })
  async streamSynopsis(
    @Req() req: Request,
    @Res() res: Response,
    @Param('assignmentId') assignmentId: string,
    @Headers('range') range?: string,
  ): Promise<void> {
    return this.queueService.streamSynopsis(
      req.user!.userId!,
      assignmentId,
      res,
      range,
    );
  }
}
