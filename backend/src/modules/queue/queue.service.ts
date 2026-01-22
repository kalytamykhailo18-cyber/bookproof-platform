import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '@common/prisma/prisma.service';
import { FilesService } from '@modules/files/files.service';
import { EmailService } from '@modules/email/email.service';
import { NotificationsService } from '@modules/notifications/notifications.service';
import { ApplyToCampaignDto } from './dto/apply-to-campaign.dto';
import { AssignmentResponseDto } from './dto/assignment-response.dto';
import { AvailableCampaignDto } from './dto/available-campaigns-response.dto';
import {
  AssignmentStatus,
  CampaignStatus,
  BookFormat,
  ContentPreference,
  EmailType,
} from '@prisma/client';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    private prisma: PrismaService,
    private filesService: FilesService,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Get all available campaigns for readers to apply
   */
  async getAvailableCampaigns(userId: string): Promise<AvailableCampaignDto[]> {
    const readerProfile = await this.prisma.readerProfile.findUnique({
      where: { userId },
      include: {
        assignments: {
          select: { bookId: true },
        },
      },
    });

    if (!readerProfile) {
      throw new NotFoundException('Reader profile not found');
    }

    // Get all active campaigns with count of pending assignments (WAITING/SCHEDULED)
    // This ensures estimated queue position matches what reader will actually get
    const campaigns = await this.prisma.book.findMany({
      where: {
        status: CampaignStatus.ACTIVE,
      },
      include: {
        _count: {
          select: {
            readerAssignments: {
              where: {
                status: {
                  in: [AssignmentStatus.WAITING, AssignmentStatus.SCHEDULED],
                },
              },
            },
          },
        },
      },
      orderBy: {
        campaignStartDate: 'desc',
      },
    });

    // Map campaigns to response DTOs
    // NOTE: Per requirement "Readers cannot see total campaign scope or author information"
    // We do NOT expose: targetReviews, totalReviewsDelivered, reviewsPerWeek
    return campaigns.map((campaign) => {
      const hasApplied = readerProfile.assignments.some((a) => a.bookId === campaign.id);

      // Estimate queue position and week (internal calculation only)
      // Use count of WAITING/SCHEDULED to match actual queuePosition calculation in applyToCampaign
      const pendingAssignmentsCount = campaign._count.readerAssignments;
      const reviewsPerWeek = campaign.reviewsPerWeek || 1;

      const estimatedQueuePosition = hasApplied ? undefined : pendingAssignmentsCount + 1;
      const estimatedWeek = hasApplied
        ? undefined
        : Math.ceil((pendingAssignmentsCount + 1) / reviewsPerWeek);

      return {
        id: campaign.id,
        title: campaign.title,
        authorName: campaign.authorName,
        synopsis: campaign.synopsis,
        language: campaign.language,
        genre: campaign.genre,
        category: campaign.category,
        availableFormats: campaign.availableFormats,
        coverImageUrl: campaign.coverImageUrl || undefined,
        // targetReviews, totalReviewsDelivered, reviewsPerWeek - NOT exposed to readers
        status: campaign.status,
        hasApplied,
        estimatedQueuePosition,
        estimatedWeek,
        pageCount: campaign.pageCount || undefined,
        audioBookDuration: campaign.audioBookDuration
          ? Math.floor(campaign.audioBookDuration / 60)
          : undefined,
        createdAt: campaign.createdAt,
      };
    });
  }

  /**
   * Reader applies to a campaign (enters queue in WAITING status)
   */
  async applyToCampaign(userId: string, dto: ApplyToCampaignDto): Promise<AssignmentResponseDto> {
    const readerProfile = await this.prisma.readerProfile.findUnique({
      where: { userId },
      include: {
        amazonProfiles: true,
      },
    });

    if (!readerProfile) {
      throw new NotFoundException('Reader profile not found');
    }

    // Check if reader has Amazon profiles
    if (readerProfile.amazonProfiles.length === 0) {
      throw new BadRequestException(
        'Please add at least one Amazon profile before applying to campaigns',
      );
    }

    // Get campaign details
    const campaign = await this.prisma.book.findUnique({
      where: { id: dto.bookId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.status !== CampaignStatus.ACTIVE) {
      throw new BadRequestException('Campaign is not active');
    }

    // Check if reader already has active/pending assignment for this book
    const activeAssignment = await this.prisma.readerAssignment.findFirst({
      where: {
        bookId: dto.bookId,
        readerProfileId: readerProfile.id,
        status: {
          notIn: [
            AssignmentStatus.EXPIRED,
            AssignmentStatus.REASSIGNED,
            AssignmentStatus.CANCELLED,
          ],
        },
      },
    });

    if (activeAssignment) {
      throw new ConflictException('You already have an active assignment for this campaign');
    }

    // Maximum 3 reviews per book per reader (enforced by system)
    const MAX_REVIEWS_PER_BOOK_PER_READER = 3;
    const completedReviewsCount = await this.prisma.review.count({
      where: {
        bookId: dto.bookId,
        readerProfileId: readerProfile.id,
      },
    });

    if (completedReviewsCount >= MAX_REVIEWS_PER_BOOK_PER_READER) {
      throw new ConflictException(
        `Maximum ${MAX_REVIEWS_PER_BOOK_PER_READER} reviews per book per reader. You have already reviewed this book ${completedReviewsCount} time(s).`,
      );
    }

    // Determine format based on preference
    let formatAssigned: BookFormat;
    let creditsValue: number;

    if (dto.formatPreference) {
      // Use specified preference
      formatAssigned = dto.formatPreference;
    } else {
      // Auto-assign based on reader and campaign compatibility
      if (
        readerProfile.contentPreference === ContentPreference.EBOOK ||
        campaign.availableFormats === BookFormat.EBOOK
      ) {
        formatAssigned = BookFormat.EBOOK;
      } else if (
        readerProfile.contentPreference === ContentPreference.AUDIOBOOK ||
        campaign.availableFormats === BookFormat.AUDIOBOOK
      ) {
        formatAssigned = BookFormat.AUDIOBOOK;
      } else {
        // Both reader and campaign support both formats, default to ebook
        formatAssigned = BookFormat.EBOOK;
      }
    }

    // Validate format compatibility
    if (campaign.availableFormats === BookFormat.BOTH) {
      // Campaign supports both, any format is fine
      creditsValue = formatAssigned === BookFormat.AUDIOBOOK ? 2 : 1;
    } else if (campaign.availableFormats === formatAssigned) {
      // Perfect match
      creditsValue = formatAssigned === BookFormat.AUDIOBOOK ? 2 : 1;
    } else {
      throw new BadRequestException(
        `Campaign only offers ${campaign.availableFormats}, but your preference is ${formatAssigned}`,
      );
    }

    // Select Amazon profile (use specified or first available)
    const amazonProfileId =
      dto.amazonProfileId || readerProfile.amazonProfiles[0]?.id;

    if (!amazonProfileId) {
      throw new BadRequestException('No Amazon profile available');
    }

    // Get current queue position (count existing assignments + 1)
    const currentAssignmentsCount = await this.prisma.readerAssignment.count({
      where: {
        bookId: dto.bookId,
        status: {
          in: [AssignmentStatus.WAITING, AssignmentStatus.SCHEDULED],
        },
      },
    });

    const queuePosition = currentAssignmentsCount + 1;

    // Create assignment in WAITING status
    const assignment = await this.prisma.readerAssignment.create({
      data: {
        bookId: dto.bookId,
        readerProfileId: readerProfile.id,
        status: AssignmentStatus.WAITING,
        formatAssigned,
        creditsValue,
        amazonProfileId,
        queuePosition,
        isBufferAssignment: false, // Buffer assignments are created by scheduler
      },
      include: {
        book: true,
      },
    });

    // Get reader user details for email
    const readerUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    // Send "Application Received" email to reader
    // Per requirements Section 3.3: After applying, reader should receive confirmation
    if (readerUser) {
      const reviewsPerWeek = campaign.reviewsPerWeek || 10;
      const estimatedWeek = Math.ceil(queuePosition / reviewsPerWeek);

      try {
        await this.emailService.sendTemplatedEmail(
          readerUser.email,
          EmailType.READER_APPLICATION_RECEIVED,
          {
            readerName: readerUser.name || 'Reader',
            bookTitle: assignment.book.title,
            queuePosition: queuePosition,
            estimatedWeek: estimatedWeek,
            formatAssigned: formatAssigned,
            dashboardUrl: '/reader/dashboard',
          },
          readerUser.id,
          readerUser.preferredLanguage,
        );
        this.logger.log(`Sent application received email to reader ${readerUser.email}`);
      } catch (emailError) {
        // Don't fail the application if email fails
        this.logger.error(`Failed to send application email: ${emailError.message}`);
      }

      // Create in-app notification (Requirements Section 13.2)
      try {
        await this.notificationsService.notifyReaderApplicationAccepted(
          userId,
          assignment.book.title,
          queuePosition,
        );
      } catch (notifError) {
        // Don't fail the application if notification fails
        this.logger.error(`Failed to send notification: ${notifError.message}`);
      }
    }

    return this.mapAssignmentToResponse(assignment);
  }

  /**
   * Get all assignments for a reader
   */
  async getMyAssignments(userId: string): Promise<AssignmentResponseDto[]> {
    const readerProfile = await this.prisma.readerProfile.findUnique({
      where: { userId },
    });

    if (!readerProfile) {
      throw new NotFoundException('Reader profile not found');
    }

    const assignments = await this.prisma.readerAssignment.findMany({
      where: {
        readerProfileId: readerProfile.id,
      },
      include: {
        book: true,
      },
      orderBy: [
        { status: 'asc' }, // Active assignments first
        { scheduledDate: 'asc' }, // Then by scheduled date
        { createdAt: 'desc' }, // Finally by creation date
      ],
    });

    return Promise.all(
      assignments.map((assignment) => this.mapAssignmentToResponse(assignment)),
    );
  }

  /**
   * Get assignment details by ID
   */
  async getAssignmentById(
    userId: string,
    assignmentId: string,
  ): Promise<AssignmentResponseDto> {
    const readerProfile = await this.prisma.readerProfile.findUnique({
      where: { userId },
    });

    if (!readerProfile) {
      throw new NotFoundException('Reader profile not found');
    }

    const assignment = await this.prisma.readerAssignment.findFirst({
      where: {
        id: assignmentId,
        readerProfileId: readerProfile.id,
      },
      include: {
        book: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return this.mapAssignmentToResponse(assignment);
  }

  /**
   * Withdraw from assignment (only if WAITING or SCHEDULED)
   */
  async withdrawFromAssignment(userId: string, assignmentId: string): Promise<void> {
    const readerProfile = await this.prisma.readerProfile.findUnique({
      where: { userId },
    });

    if (!readerProfile) {
      throw new NotFoundException('Reader profile not found');
    }

    const assignment = await this.prisma.readerAssignment.findFirst({
      where: {
        id: assignmentId,
        readerProfileId: readerProfile.id,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Can only withdraw if WAITING or SCHEDULED
    if (
      assignment.status !== AssignmentStatus.WAITING &&
      assignment.status !== AssignmentStatus.SCHEDULED
    ) {
      throw new BadRequestException(
        'Cannot withdraw from assignment that has materials released',
      );
    }

    // Mark as cancelled
    await this.prisma.readerAssignment.update({
      where: { id: assignmentId },
      data: {
        status: AssignmentStatus.CANCELLED,
        withdrawnByReader: true,
        withdrawnAt: new Date(),
        withdrawalReason: 'Reader withdrew from assignment',
      },
    });
  }

  /**
   * Track ebook download and update status to IN_PROGRESS
   * This marks the reader as actively working on the review
   */
  async trackEbookDownload(userId: string, assignmentId: string): Promise<void> {
    const readerProfile = await this.prisma.readerProfile.findUnique({
      where: { userId },
    });

    if (!readerProfile) {
      throw new NotFoundException('Reader profile not found');
    }

    const assignment = await this.prisma.readerAssignment.findFirst({
      where: {
        id: assignmentId,
        readerProfileId: readerProfile.id,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Only update status to IN_PROGRESS if currently APPROVED
    // This indicates reader is now actively working on the review
    const updateData: any = {
      ebookDownloadedAt: new Date(),
    };

    if (assignment.status === AssignmentStatus.APPROVED) {
      updateData.status = AssignmentStatus.IN_PROGRESS;
    }

    await this.prisma.readerAssignment.update({
      where: { id: assignmentId },
      data: updateData,
    });
  }

  /**
   * Track audiobook access and update status to IN_PROGRESS
   * This marks the reader as actively working on the review
   */
  async trackAudiobookAccess(userId: string, assignmentId: string): Promise<void> {
    const readerProfile = await this.prisma.readerProfile.findUnique({
      where: { userId },
    });

    if (!readerProfile) {
      throw new NotFoundException('Reader profile not found');
    }

    const assignment = await this.prisma.readerAssignment.findFirst({
      where: {
        id: assignmentId,
        readerProfileId: readerProfile.id,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Only update status to IN_PROGRESS if currently APPROVED
    // This indicates reader is now actively working on the review
    const updateData: any = {
      lastAudioAccessAt: new Date(),
    };

    if (assignment.status === AssignmentStatus.APPROVED) {
      updateData.status = AssignmentStatus.IN_PROGRESS;
    }

    await this.prisma.readerAssignment.update({
      where: { id: assignmentId },
      data: updateData,
    });
  }

  /**
   * Secure audio streaming
   *
   * SECURITY: Implements all audiobook security requirements:
   * 1. Access restricted to logged-in readers only
   * 2. Validates user owns the assignment
   * 3. Validates 7-day audiobook access window hasn't expired
   * 4. Validates assignment is in valid state (APPROVED, IN_PROGRESS, SUBMITTED)
   * 5. Streams audio without exposing the actual file URL
   * 6. Supports Range headers for seeking
   *
   * Per requirements:
   * - Time-limited access window: 7 days after access granted
   * - Access expires after 7-day window regardless of login status
   * - Reader must still submit review within 72 hours of access
   */
  async streamAudiobook(
    userId: string,
    assignmentId: string,
    res: Response,
    rangeHeader?: string,
  ): Promise<void> {
    const readerProfile = await this.prisma.readerProfile.findUnique({
      where: { userId },
    });

    if (!readerProfile) {
      throw new NotFoundException('Reader profile not found');
    }

    const assignment = await this.prisma.readerAssignment.findFirst({
      where: {
        id: assignmentId,
        readerProfileId: readerProfile.id,
      },
      include: {
        book: {
          select: {
            audioBookFileUrl: true,
            title: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Validate assignment is audiobook format
    if (assignment.formatAssigned !== BookFormat.AUDIOBOOK) {
      throw new ForbiddenException('This assignment is not for an audiobook');
    }

    // Validate materials have been released
    if (!assignment.materialsReleasedAt) {
      throw new ForbiddenException('Materials have not been released yet');
    }

    // Validate assignment status allows access
    const allowedStatuses: AssignmentStatus[] = [
      AssignmentStatus.APPROVED,
      AssignmentStatus.IN_PROGRESS,
      AssignmentStatus.SUBMITTED,
    ];
    if (!allowedStatuses.includes(assignment.status)) {
      throw new ForbiddenException(
        `Audio access denied. Assignment status is ${assignment.status}`,
      );
    }

    // Validate 7-day audiobook access window
    const now = new Date();
    const materialsReleasedAt = new Date(assignment.materialsReleasedAt);
    const accessExpiresAt = assignment.materialsExpiresAt
      ? new Date(assignment.materialsExpiresAt)
      : new Date(materialsReleasedAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    if (now > accessExpiresAt) {
      throw new ForbiddenException(
        'Audio access has expired. The 7-day access window has passed.',
      );
    }

    // Validate audiobook file exists
    if (!assignment.book.audioBookFileUrl) {
      throw new NotFoundException('Audiobook file not found');
    }

    // Extract file key from URL
    const fileKey = this.filesService.extractKeyFromUrl(assignment.book.audioBookFileUrl);
    if (!fileKey) {
      this.logger.error(`Failed to extract key from URL: ${assignment.book.audioBookFileUrl}`);
      throw new NotFoundException('Audiobook file configuration error');
    }

    // Track access (update status to IN_PROGRESS if APPROVED)
    if (assignment.status === AssignmentStatus.APPROVED) {
      await this.prisma.readerAssignment.update({
        where: { id: assignmentId },
        data: {
          status: AssignmentStatus.IN_PROGRESS,
          lastAudioAccessAt: now,
        },
      });
    } else {
      // Just update last access time
      await this.prisma.readerAssignment.update({
        where: { id: assignmentId },
        data: {
          lastAudioAccessAt: now,
        },
      });
    }

    try {
      // Get file metadata for content-length
      const metadata = await this.filesService.getFileMetadata(fileKey);
      const fileSize = metadata.contentLength;

      // Parse Range header if present
      let range: { start: number; end?: number } | undefined;
      let statusCode = 200;

      if (rangeHeader) {
        const parts = rangeHeader.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (!isNaN(start) && start < fileSize) {
          range = { start, end: Math.min(end, fileSize - 1) };
          statusCode = 206; // Partial Content
        }
      }

      // Stream the file
      const { stream, contentLength, contentType, contentRange } =
        await this.filesService.streamFile(fileKey, range);

      // Set response headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Accept-Ranges', 'bytes');
      // SECURITY: Prevent caching of audio content
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      // SECURITY: Prevent download
      res.setHeader('Content-Disposition', 'inline');

      if (statusCode === 206 && range) {
        res.setHeader('Content-Length', range.end! - range.start + 1);
        res.setHeader(
          'Content-Range',
          contentRange || `bytes ${range.start}-${range.end}/${fileSize}`,
        );
      } else {
        res.setHeader('Content-Length', fileSize);
      }

      res.status(statusCode);

      // Pipe the stream to response
      stream.pipe(res);

      this.logger.log(
        `Streaming audiobook for assignment ${assignmentId}: ${assignment.book.title}`,
      );
    } catch (error) {
      this.logger.error(`Failed to stream audiobook: ${error}`);
      throw error;
    }
  }

  /**
   * Secure ebook streaming
   *
   * SECURITY: Implements all ebook security requirements:
   * 1. Access restricted to logged-in readers only
   * 2. Validates user owns the assignment
   * 3. Validates 72-hour deadline hasn't expired
   * 4. Validates assignment is in valid state (APPROVED, IN_PROGRESS, SUBMITTED)
   * 5. Streams ebook without exposing the actual file URL
   * 6. Supports Range headers for large files
   *
   * Per requirements Section 11.2:
   * - Only granted readers can access
   * - URL signed with reader ID and expiration
   * - Expires when deadline passes (72 hours)
   * - Download allowed
   */
  async streamEbook(
    userId: string,
    assignmentId: string,
    res: Response,
    rangeHeader?: string,
  ): Promise<void> {
    const readerProfile = await this.prisma.readerProfile.findUnique({
      where: { userId },
    });

    if (!readerProfile) {
      throw new NotFoundException('Reader profile not found');
    }

    const assignment = await this.prisma.readerAssignment.findFirst({
      where: {
        id: assignmentId,
        readerProfileId: readerProfile.id,
      },
      include: {
        book: {
          select: {
            ebookFileUrl: true,
            ebookFileName: true,
            title: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Validate assignment is ebook format
    if (assignment.formatAssigned !== BookFormat.EBOOK) {
      throw new ForbiddenException('This assignment is not for an ebook');
    }

    // Validate materials have been released
    if (!assignment.materialsReleasedAt) {
      throw new ForbiddenException('Materials have not been released yet');
    }

    // Validate assignment status allows access
    const allowedStatuses: AssignmentStatus[] = [
      AssignmentStatus.APPROVED,
      AssignmentStatus.IN_PROGRESS,
      AssignmentStatus.SUBMITTED,
    ];
    if (!allowedStatuses.includes(assignment.status)) {
      throw new ForbiddenException(
        `Ebook access denied. Assignment status is ${assignment.status}`,
      );
    }

    // Validate 72-hour deadline hasn't expired
    if (assignment.deadlineAt) {
      const now = new Date();
      const deadline = new Date(assignment.deadlineAt);
      if (now > deadline) {
        throw new ForbiddenException(
          'Ebook access has expired. The 72-hour deadline has passed.',
        );
      }
    }

    // Validate ebook file exists
    if (!assignment.book.ebookFileUrl) {
      throw new NotFoundException('Ebook file not found');
    }

    // Extract file key from URL
    const fileKey = this.filesService.extractKeyFromUrl(assignment.book.ebookFileUrl);
    if (!fileKey) {
      this.logger.error(`Failed to extract key from URL: ${assignment.book.ebookFileUrl}`);
      throw new NotFoundException('Ebook file configuration error');
    }

    // Track access (update status to IN_PROGRESS if APPROVED)
    const now = new Date();
    if (assignment.status === AssignmentStatus.APPROVED) {
      await this.prisma.readerAssignment.update({
        where: { id: assignmentId },
        data: {
          status: AssignmentStatus.IN_PROGRESS,
          ebookDownloadedAt: now,
        },
      });
    } else if (!assignment.ebookDownloadedAt) {
      // Just track first download time
      await this.prisma.readerAssignment.update({
        where: { id: assignmentId },
        data: {
          ebookDownloadedAt: now,
        },
      });
    }

    try {
      // Get file metadata for content-length
      const metadata = await this.filesService.getFileMetadata(fileKey);
      const fileSize = metadata.contentLength;

      // Parse Range header if present
      let range: { start: number; end?: number } | undefined;
      let statusCode = 200;

      if (rangeHeader) {
        const parts = rangeHeader.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (!isNaN(start) && start < fileSize) {
          range = { start, end: Math.min(end, fileSize - 1) };
          statusCode = 206; // Partial Content
        }
      }

      // Stream the file
      const { stream, contentLength, contentType, contentRange } =
        await this.filesService.streamFile(fileKey, range);

      // Set response headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Accept-Ranges', 'bytes');
      // SECURITY: Prevent caching of ebook content
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      // Allow download (unlike audiobook)
      const fileName = assignment.book.ebookFileName || 'ebook.pdf';
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

      if (statusCode === 206 && range) {
        res.setHeader('Content-Length', range.end! - range.start + 1);
        res.setHeader(
          'Content-Range',
          contentRange || `bytes ${range.start}-${range.end}/${fileSize}`,
        );
      } else {
        res.setHeader('Content-Length', fileSize);
      }

      res.status(statusCode);

      // Pipe the stream to response
      stream.pipe(res);

      this.logger.log(
        `Streaming ebook for assignment ${assignmentId}: ${assignment.book.title}`,
      );
    } catch (error) {
      this.logger.error(`Failed to stream ebook: ${error}`);
      throw error;
    }
  }

  /**
   * Secure synopsis streaming
   *
   * SECURITY: Implements synopsis security requirements:
   * 1. Access restricted to logged-in readers only
   * 2. Validates user owns the assignment
   * 3. Validates materials have been released
   * 4. Validates assignment is in valid state
   * 5. Streams synopsis without exposing the actual file URL
   * 6. Available for both ebook and audiobook formats
   *
   * Per requirements Section 11.2:
   * - Same as ebook (only granted readers)
   * - Available alongside main content
   */
  async streamSynopsis(
    userId: string,
    assignmentId: string,
    res: Response,
    rangeHeader?: string,
  ): Promise<void> {
    const readerProfile = await this.prisma.readerProfile.findUnique({
      where: { userId },
    });

    if (!readerProfile) {
      throw new NotFoundException('Reader profile not found');
    }

    const assignment = await this.prisma.readerAssignment.findFirst({
      where: {
        id: assignmentId,
        readerProfileId: readerProfile.id,
      },
      include: {
        book: {
          select: {
            synopsisFileUrl: true,
            synopsisFileName: true,
            title: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Validate materials have been released
    if (!assignment.materialsReleasedAt) {
      throw new ForbiddenException('Materials have not been released yet');
    }

    // Validate assignment status allows access
    const allowedStatuses: AssignmentStatus[] = [
      AssignmentStatus.APPROVED,
      AssignmentStatus.IN_PROGRESS,
      AssignmentStatus.SUBMITTED,
    ];
    if (!allowedStatuses.includes(assignment.status)) {
      throw new ForbiddenException(
        `Synopsis access denied. Assignment status is ${assignment.status}`,
      );
    }

    // For ebook format: Validate 72-hour deadline hasn't expired
    if (assignment.formatAssigned === BookFormat.EBOOK && assignment.deadlineAt) {
      const now = new Date();
      const deadline = new Date(assignment.deadlineAt);
      if (now > deadline) {
        throw new ForbiddenException(
          'Synopsis access has expired. The 72-hour deadline has passed.',
        );
      }
    }

    // For audiobook format: Validate 7-day access window
    if (assignment.formatAssigned === BookFormat.AUDIOBOOK && assignment.materialsReleasedAt) {
      const now = new Date();
      const materialsReleasedAt = new Date(assignment.materialsReleasedAt);
      const accessExpiresAt = assignment.materialsExpiresAt
        ? new Date(assignment.materialsExpiresAt)
        : new Date(materialsReleasedAt.getTime() + 7 * 24 * 60 * 60 * 1000);

      if (now > accessExpiresAt) {
        throw new ForbiddenException(
          'Synopsis access has expired. The 7-day access window has passed.',
        );
      }
    }

    // Validate synopsis file exists
    if (!assignment.book.synopsisFileUrl) {
      throw new NotFoundException('Synopsis file not found');
    }

    // Extract file key from URL
    const fileKey = this.filesService.extractKeyFromUrl(assignment.book.synopsisFileUrl);
    if (!fileKey) {
      this.logger.error(`Failed to extract key from URL: ${assignment.book.synopsisFileUrl}`);
      throw new NotFoundException('Synopsis file configuration error');
    }

    try {
      // Get file metadata for content-length
      const metadata = await this.filesService.getFileMetadata(fileKey);
      const fileSize = metadata.contentLength;

      // Parse Range header if present
      let range: { start: number; end?: number } | undefined;
      let statusCode = 200;

      if (rangeHeader) {
        const parts = rangeHeader.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (!isNaN(start) && start < fileSize) {
          range = { start, end: Math.min(end, fileSize - 1) };
          statusCode = 206; // Partial Content
        }
      }

      // Stream the file
      const { stream, contentLength, contentType, contentRange } =
        await this.filesService.streamFile(fileKey, range);

      // Set response headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Accept-Ranges', 'bytes');
      // SECURITY: Prevent caching
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      // Display inline in browser
      const fileName = assignment.book.synopsisFileName || 'synopsis.pdf';
      res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

      if (statusCode === 206 && range) {
        res.setHeader('Content-Length', range.end! - range.start + 1);
        res.setHeader(
          'Content-Range',
          contentRange || `bytes ${range.start}-${range.end}/${fileSize}`,
        );
      } else {
        res.setHeader('Content-Length', fileSize);
      }

      res.status(statusCode);

      // Pipe the stream to response
      stream.pipe(res);

      this.logger.log(
        `Streaming synopsis for assignment ${assignmentId}: ${assignment.book.title}`,
      );
    } catch (error) {
      this.logger.error(`Failed to stream synopsis: ${error}`);
      throw error;
    }
  }

  /**
   * Map assignment to response DTO
   *
   * IMPORTANT: Per Rule 2 - "Buffer is completely invisible to authors"
   * This also applies to readers - isBufferAssignment is NOT exposed here.
   *
   * SECURITY: For audiobooks, we now return the secure streaming endpoint URL
   * instead of direct signed URLs. This prevents URL sharing and enables
   * server-side access control with 7-day window enforcement.
   */
  private async mapAssignmentToResponse(assignment: any): Promise<AssignmentResponseDto> {
    const book = assignment.book;

    // Calculate hours remaining until deadline (with decimal for minutes display)
    // Frontend uses this to show HH:MM countdown timer
    let hoursRemaining: number | undefined;
    if (assignment.deadlineAt) {
      const now = new Date();
      const deadline = new Date(assignment.deadlineAt);
      const diffMs = deadline.getTime() - now.getTime();
      // Return decimal value (e.g., 47.5 = 47h 30m) for accurate minute display
      hoursRemaining = Math.max(0, diffMs / (1000 * 60 * 60));
    }

    // SECURITY: Return secure streaming endpoint URLs for all content types
    // This ensures all security checks are enforced on each access
    // Per Section 11.2 requirements:
    // - Audiobook: 7-day access window
    // - Ebook: 72-hour deadline
    // - Synopsis: Same expiration as format (7 days for audiobook, 72h for ebook)

    let audioBookStreamUrl: string | undefined;
    let ebookStreamUrl: string | undefined;
    let synopsisStreamUrl: string | undefined;

    const now = new Date();

    // For audiobooks: Return the secure streaming endpoint URL
    if (
      assignment.materialsReleasedAt &&
      assignment.formatAssigned === BookFormat.AUDIOBOOK &&
      book.audioBookFileUrl
    ) {
      // Validate 7-day access window hasn't expired
      const materialsReleasedAt = new Date(assignment.materialsReleasedAt);
      const accessExpiresAt = assignment.materialsExpiresAt
        ? new Date(assignment.materialsExpiresAt)
        : new Date(materialsReleasedAt.getTime() + 7 * 24 * 60 * 60 * 1000);

      if (now <= accessExpiresAt) {
        audioBookStreamUrl = `/api/queue/assignments/${assignment.id}/stream-audio`;
      }
      // If expired, audioBookStreamUrl remains undefined (no access)
    }

    // For ebooks: Return the secure streaming endpoint URL
    if (
      assignment.materialsReleasedAt &&
      assignment.formatAssigned === BookFormat.EBOOK &&
      book.ebookFileUrl
    ) {
      // Validate 72-hour deadline hasn't expired
      if (assignment.deadlineAt) {
        const deadline = new Date(assignment.deadlineAt);
        if (now <= deadline) {
          ebookStreamUrl = `/api/queue/assignments/${assignment.id}/stream-ebook`;
        }
        // If expired, ebookStreamUrl remains undefined (no access)
      } else {
        // No deadline set yet - still allow access
        ebookStreamUrl = `/api/queue/assignments/${assignment.id}/stream-ebook`;
      }
    }

    // For synopsis: Available for both formats with their respective expiration rules
    if (assignment.materialsReleasedAt && book.synopsisFileUrl) {
      let synopsisExpired = false;

      if (assignment.formatAssigned === BookFormat.AUDIOBOOK) {
        // 7-day access window for audiobook
        const materialsReleasedAt = new Date(assignment.materialsReleasedAt);
        const accessExpiresAt = assignment.materialsExpiresAt
          ? new Date(assignment.materialsExpiresAt)
          : new Date(materialsReleasedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
        synopsisExpired = now > accessExpiresAt;
      } else if (assignment.formatAssigned === BookFormat.EBOOK) {
        // 72-hour deadline for ebook
        if (assignment.deadlineAt) {
          const deadline = new Date(assignment.deadlineAt);
          synopsisExpired = now > deadline;
        }
      }

      if (!synopsisExpired) {
        synopsisStreamUrl = `/api/queue/assignments/${assignment.id}/stream-synopsis`;
      }
    }

    return {
      id: assignment.id,
      bookId: assignment.bookId,
      book: {
        id: book.id,
        title: book.title,
        authorName: book.authorName,
        genre: book.genre,
        coverImageUrl: book.coverImageUrl || undefined,
        synopsis: book.synopsis,
        // DEPRECATED: Direct synopsisFileUrl no longer exposed for security
        // Use synopsisStreamUrl instead (secure streaming endpoint)
        synopsisFileUrl: undefined,
        availableFormats: book.availableFormats,
      },
      readerProfileId: assignment.readerProfileId,
      status: assignment.status,
      formatAssigned: assignment.formatAssigned,
      creditsValue: assignment.creditsValue,
      queuePosition: assignment.queuePosition || undefined,
      scheduledWeek: assignment.scheduledWeek || undefined,
      scheduledDate: assignment.scheduledDate || undefined,
      materialsReleasedAt: assignment.materialsReleasedAt || undefined,
      deadlineAt: assignment.deadlineAt || undefined,
      hoursRemaining,
      // NOTE: isBufferAssignment intentionally NOT included per Rule 2
      // Buffer assignments are completely invisible to both authors AND readers

      // SECURITY: All file access now goes through secure streaming endpoints
      // DEPRECATED: Direct ebookFileUrl no longer exposed
      ebookFileUrl: undefined,
      // NEW: Secure streaming endpoints (Section 11 compliance)
      ebookStreamUrl,
      audioBookStreamUrl,
      synopsisStreamUrl,
      // Track first access
      ebookDownloadedAt: assignment.ebookDownloadedAt || undefined,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
    };
  }
}
