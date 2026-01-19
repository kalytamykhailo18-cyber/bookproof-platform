import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { ValidationService } from './validation.service';
import { IssueManagementService } from './issue-management.service';
import { AmazonMonitoringService } from './amazon-monitoring.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { SubmitReviewDto } from './dto/submit-review.dto';
import { ValidateReviewDto, BulkValidateReviewsDto } from './dto/validate-review.dto';
import { CreateIssueDto, ResolveIssueDto, MarkAsRemovedByAmazonDto, RequestResubmissionDto } from './dto/issue-management.dto';
import {
  ReviewResponseDto,
  ReaderReviewResponseDto,
  PendingReviewsStatsDto,
  ReviewIssueDto,
  ReviewMonitorDto,
  MonitoringStatsDto,
  MarkAsRemovedResponseDto,
} from './dto/review-response.dto';

@ApiTags('Reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReviewsController {
  constructor(
    private reviewsService: ReviewsService,
    private validationService: ValidationService,
    private issueManagementService: IssueManagementService,
    private amazonMonitoringService: AmazonMonitoringService,
  ) {}

  // ============================================
  // READER ENDPOINTS
  // PRIVACY: All reader endpoints return ReaderReviewResponseDto
  // which excludes admin-only fields and other readers' information
  // ============================================

  @Post('assignments/:assignmentId/submit')
  @Roles(UserRole.READER)
  @ApiOperation({ summary: 'Submit review for assignment (Reader)' })
  @ApiResponse({ status: 201, description: 'Review submitted successfully', type: ReaderReviewResponseDto })
  async submitReview(
    @Req() req: Request,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: SubmitReviewDto,
  ): Promise<ReaderReviewResponseDto> {
    const readerProfileId = req.user!.readerProfileId!;
    return this.reviewsService.submitReview(readerProfileId, assignmentId, dto);
  }

  @Get('my-reviews')
  @Roles(UserRole.READER)
  @ApiOperation({ summary: 'Get all reviews submitted by current reader' })
  @ApiResponse({ status: 200, description: 'Returns all reader reviews', type: [ReaderReviewResponseDto] })
  async getMyReviews(@Req() req: Request): Promise<ReaderReviewResponseDto[]> {
    const readerProfileId = req.user!.readerProfileId!;
    return this.reviewsService.getReaderReviews(readerProfileId);
  }

  @Get('assignments/:assignmentId')
  @Roles(UserRole.READER)
  @ApiOperation({ summary: 'Get review for specific assignment' })
  @ApiResponse({ status: 200, description: 'Returns review for assignment', type: ReaderReviewResponseDto })
  async getReviewByAssignment(
    @Req() req: Request,
    @Param('assignmentId') assignmentId: string,
  ): Promise<ReaderReviewResponseDto | null> {
    const readerProfileId = req.user!.readerProfileId!;
    return this.reviewsService.getReviewByAssignment(assignmentId, readerProfileId);
  }

  // ============================================
  // ADMIN ENDPOINTS - VALIDATION
  // ============================================

  @Get('pending')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all pending reviews for validation (Admin)' })
  @ApiResponse({ status: 200, description: 'Returns all pending reviews', type: [ReviewResponseDto] })
  async getPendingReviews(): Promise<ReviewResponseDto[]> {
    return this.reviewsService.getPendingReviews();
  }

  @Get('pending/stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get statistics for pending reviews (Admin)' })
  @ApiResponse({ status: 200, description: 'Returns pending review statistics', type: PendingReviewsStatsDto })
  async getPendingReviewsStats(): Promise<PendingReviewsStatsDto> {
    return this.reviewsService.getPendingReviewsStats();
  }

  @Put(':reviewId/validate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Validate a review - approve/reject/flag (Admin)' })
  @ApiResponse({ status: 200, description: 'Review validated successfully', type: ReviewResponseDto })
  async validateReview(
    @Req() req: Request,
    @Param('reviewId') reviewId: string,
    @Body() dto: ValidateReviewDto,
  ): Promise<ReviewResponseDto> {
    const adminUserId = req.user!.userId!;
    return this.validationService.validateReview(reviewId, dto, adminUserId);
  }

  @Post('bulk-validate')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk validate multiple reviews (Admin)' })
  @ApiResponse({ status: 200, description: 'Reviews validated successfully', type: [ReviewResponseDto] })
  async bulkValidateReviews(
    @Req() req: Request,
    @Body() dto: BulkValidateReviewsDto,
  ): Promise<ReviewResponseDto[]> {
    const adminUserId = req.user!.userId!;
    return this.validationService.bulkValidateReviews(dto, adminUserId);
  }

  @Get(':reviewId')
  @Roles(UserRole.ADMIN, UserRole.READER)
  @ApiOperation({
    summary: 'Get review by ID',
    description: 'Returns review details. Readers only see their own reviews with limited fields. Admins see full details.',
  })
  @ApiResponse({ status: 200, description: 'Returns review details (PRIVACY: Reader gets limited fields, Admin gets full details)' })
  async getReviewById(
    @Req() req: Request,
    @Param('reviewId') reviewId: string,
  ): Promise<ReviewResponseDto | ReaderReviewResponseDto> {
    // PRIVACY: Service returns role-appropriate DTO
    // - Readers get ReaderReviewResponseDto (limited fields)
    // - Admins get ReviewResponseDto (full fields)
    return this.reviewsService.getReviewById(
      reviewId,
      req.user!.role,
      req.user!.readerProfileId,
    );
  }

  // ============================================
  // ADMIN ENDPOINTS - ISSUE MANAGEMENT
  // ============================================

  @Get('issues/open')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all open issues (Admin)' })
  @ApiResponse({ status: 200, description: 'Returns all open issues', type: [ReviewIssueDto] })
  async getOpenIssues(): Promise<ReviewIssueDto[]> {
    return this.issueManagementService.getOpenIssues();
  }

  @Post(':reviewId/issues')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create issue for review (Admin)' })
  @ApiResponse({ status: 201, description: 'Issue created successfully', type: ReviewIssueDto })
  async createIssue(
    @Req() req: Request,
    @Param('reviewId') reviewId: string,
    @Body() dto: CreateIssueDto,
  ): Promise<ReviewIssueDto> {
    const adminUserId = req.user!.userId!;
    return this.issueManagementService.createIssue(reviewId, dto, adminUserId);
  }

  @Get(':reviewId/issues')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all issues for a review (Admin)' })
  @ApiResponse({ status: 200, description: 'Returns all review issues', type: [ReviewIssueDto] })
  async getReviewIssues(@Param('reviewId') reviewId: string): Promise<ReviewIssueDto[]> {
    return this.issueManagementService.getReviewIssues(reviewId);
  }

  @Put('issues/:issueId/resolve')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Resolve an issue (Admin)' })
  @ApiResponse({ status: 200, description: 'Issue resolved successfully', type: ReviewIssueDto })
  async resolveIssue(
    @Req() req: Request,
    @Param('issueId') issueId: string,
    @Body() dto: ResolveIssueDto,
  ): Promise<ReviewIssueDto> {
    const adminUserId = req.user!.userId!;
    return this.issueManagementService.resolveIssue(issueId, dto, adminUserId);
  }

  @Get('issues/:issueId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get issue by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Returns issue details', type: ReviewIssueDto })
  async getIssueById(@Param('issueId') issueId: string): Promise<ReviewIssueDto> {
    return this.issueManagementService.getIssueById(issueId);
  }

  @Post('issues/:issueId/request-resubmission')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Request resubmission with deadline (Admin)' })
  @ApiResponse({ status: 200, description: 'Resubmission requested successfully', type: ReviewIssueDto })
  async requestResubmission(
    @Req() req: Request,
    @Param('issueId') issueId: string,
    @Body() dto: RequestResubmissionDto,
  ): Promise<ReviewIssueDto> {
    const adminUserId = req.user!.userId!;
    return this.issueManagementService.requestResubmission(issueId, dto, adminUserId);
  }

  // ============================================
  // ADMIN ENDPOINTS - AMAZON MONITORING
  // ============================================

  @Get('monitoring/active')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all active Amazon review monitors (Admin)' })
  @ApiResponse({ status: 200, description: 'Returns all active monitors', type: [ReviewMonitorDto] })
  async getActiveMonitors(): Promise<ReviewMonitorDto[]> {
    return this.amazonMonitoringService.getActiveMonitors();
  }

  @Get('monitoring/stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get Amazon monitoring statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'Returns monitoring statistics', type: MonitoringStatsDto })
  async getMonitoringStats(): Promise<MonitoringStatsDto> {
    return this.amazonMonitoringService.getMonitoringStats();
  }

  @Put(':reviewId/mark-removed')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Mark review as removed by Amazon (Admin)' })
  @ApiResponse({ status: 200, description: 'Review marked as removed', type: MarkAsRemovedResponseDto })
  async markAsRemovedByAmazon(
    @Req() req: Request,
    @Param('reviewId') reviewId: string,
    @Body() dto: MarkAsRemovedByAmazonDto,
  ): Promise<MarkAsRemovedResponseDto> {
    const adminUserId = req.user!.userId!;
    return this.amazonMonitoringService.markAsRemoved(reviewId, dto, adminUserId);
  }
}
