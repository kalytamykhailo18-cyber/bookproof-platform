import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateReaderProfileDto } from './dto/create-reader-profile.dto';
import { UpdateReaderProfileDto } from './dto/update-reader-profile.dto';
import { ReaderProfileResponseDto, AmazonProfileDto } from './dto/reader-profile-response.dto';
import { ReaderStatsResponseDto } from './dto/reader-stats-response.dto';
import { AssignmentStatus } from '@prisma/client';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class ReadersService {
  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
  ) {}

  /**
   * Create or update reader profile
   * Called after user registration with READER role
   */
  async createOrUpdateProfile(
    userId: string,
    dto: CreateReaderProfileDto,
  ): Promise<ReaderProfileResponseDto> {
    // Check if profile already exists
    const existingProfile = await this.prisma.readerProfile.findUnique({
      where: { userId },
      include: { amazonProfiles: true },
    });

    if (existingProfile) {
      // Update existing profile
      return this.updateProfile(userId, dto);
    }

    // Create new reader profile
    const readerProfile = await this.prisma.readerProfile.create({
      data: {
        userId,
        contentPreference: dto.contentPreference,
        preferredGenres: dto.preferredGenres || [],
        // Wallet starts at zero
        walletBalance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
      },
      include: {
        amazonProfiles: true,
      },
    });

    // Add Amazon profiles if provided
    if (dto.amazonProfiles && dto.amazonProfiles.length > 0) {
      for (const profileUrl of dto.amazonProfiles) {
        await this.prisma.amazonProfile.create({
          data: {
            readerProfileId: readerProfile.id,
            profileUrl,
          },
        });
      }
    }

    // Fetch complete profile with Amazon profiles
    return this.getProfile(userId);
  }

  /**
   * Get reader profile by user ID
   */
  async getProfile(userId: string): Promise<ReaderProfileResponseDto> {
    const readerProfile = await this.prisma.readerProfile.findUnique({
      where: { userId },
      include: {
        amazonProfiles: true,
      },
    });

    if (!readerProfile) {
      throw new NotFoundException('Reader profile not found');
    }

    return this.mapToResponse(readerProfile);
  }

  /**
   * Update reader profile
   */
  async updateProfile(
    userId: string,
    dto: UpdateReaderProfileDto,
  ): Promise<ReaderProfileResponseDto> {
    const readerProfile = await this.prisma.readerProfile.findUnique({
      where: { userId },
    });

    if (!readerProfile) {
      throw new NotFoundException('Reader profile not found');
    }

    // Update profile fields
    const updatedProfile = await this.prisma.readerProfile.update({
      where: { userId },
      data: {
        contentPreference: dto.contentPreference,
        preferredGenres: dto.preferredGenres,
      },
      include: {
        amazonProfiles: true,
      },
    });

    // Handle Amazon profiles update if provided
    if (dto.amazonProfiles) {
      // Delete existing Amazon profiles
      await this.prisma.amazonProfile.deleteMany({
        where: { readerProfileId: readerProfile.id },
      });

      // Add new Amazon profiles
      for (const profileUrl of dto.amazonProfiles) {
        await this.prisma.amazonProfile.create({
          data: {
            readerProfileId: readerProfile.id,
            profileUrl,
          },
        });
      }
    }

    return this.getProfile(userId);
  }

  /**
   * Get reader statistics
   */
  async getReaderStats(userId: string): Promise<ReaderStatsResponseDto> {
    const readerProfile = await this.prisma.readerProfile.findUnique({
      where: { userId },
      include: {
        assignments: {
          select: {
            status: true,
            creditsValue: true,
            formatAssigned: true,
          },
        },
      },
    });

    if (!readerProfile) {
      throw new NotFoundException('Reader profile not found');
    }

    const assignments = readerProfile.assignments;

    // Count assignments by status
    const statusCounts = {
      waiting: assignments.filter((a) => a.status === AssignmentStatus.WAITING).length,
      scheduled: assignments.filter((a) => a.status === AssignmentStatus.SCHEDULED).length,
      approved: assignments.filter((a) => a.status === AssignmentStatus.APPROVED).length,
      inProgress: assignments.filter((a) => a.status === AssignmentStatus.IN_PROGRESS).length,
      submitted: assignments.filter((a) => a.status === AssignmentStatus.SUBMITTED).length,
      completed: assignments.filter(
        (a) => a.status === AssignmentStatus.VALIDATED || a.status === AssignmentStatus.COMPLETED,
      ).length,
      expired: assignments.filter((a) => a.status === AssignmentStatus.EXPIRED).length,
    };

    // Calculate pending earnings (submitted but not validated)
    // Compensation rates from settings (per requirements.md Section 3.8)
    const ebookRate = await this.settingsService.getEbookReviewRate();
    const audiobookRate = await this.settingsService.getAudiobookReviewRate();

    const submittedAssignments = assignments.filter(
      (a) => a.status === AssignmentStatus.SUBMITTED,
    );
    const pendingEarnings = submittedAssignments.reduce(
      (sum, a) => sum + (a.formatAssigned === 'AUDIOBOOK' ? audiobookRate : ebookRate),
      0,
    );

    // Calculate reliability score (if no completions, default to 100)
    const totalCompleted = statusCounts.completed;
    const totalExpired = statusCounts.expired;
    const totalAttempts = totalCompleted + totalExpired;
    const reliabilityScore =
      totalAttempts > 0 ? (totalCompleted / totalAttempts) * 100 : 100;

    // Calculate completion rate
    const completionRate = readerProfile.completionRate?.toNumber() || reliabilityScore;

    return {
      totalAssignments: assignments.length,
      waitingAssignments: statusCounts.waiting,
      scheduledAssignments: statusCounts.scheduled,
      activeAssignments: statusCounts.approved,
      inProgressAssignments: statusCounts.inProgress,
      submittedAssignments: statusCounts.submitted,
      completedAssignments: statusCounts.completed,
      expiredAssignments: statusCounts.expired,
      walletBalance: readerProfile.walletBalance.toNumber(),
      totalEarned: readerProfile.totalEarned.toNumber(),
      pendingEarnings: pendingEarnings,
      reliabilityScore: Math.round(reliabilityScore * 100) / 100,
      completionRate: Math.round(completionRate * 100) / 100,
    };
  }

  /**
   * Add Amazon profile to reader
   */
  async addAmazonProfile(userId: string, profileUrl: string): Promise<AmazonProfileDto> {
    const readerProfile = await this.prisma.readerProfile.findUnique({
      where: { userId },
      include: { amazonProfiles: true },
    });

    if (!readerProfile) {
      throw new NotFoundException('Reader profile not found');
    }

    // Check max limit (3 profiles)
    if (readerProfile.amazonProfiles.length >= 3) {
      throw new BadRequestException('Maximum 3 Amazon profiles allowed');
    }

    const amazonProfile = await this.prisma.amazonProfile.create({
      data: {
        readerProfileId: readerProfile.id,
        profileUrl,
      },
    });

    return {
      id: amazonProfile.id,
      profileUrl: amazonProfile.profileUrl,
      profileName: amazonProfile.profileName || undefined,
      isVerified: amazonProfile.isVerified,
      verifiedAt: amazonProfile.verifiedAt || undefined,
      createdAt: amazonProfile.createdAt,
    };
  }

  /**
   * Remove Amazon profile
   */
  async removeAmazonProfile(userId: string, profileId: string): Promise<void> {
    const readerProfile = await this.prisma.readerProfile.findUnique({
      where: { userId },
    });

    if (!readerProfile) {
      throw new NotFoundException('Reader profile not found');
    }

    // Verify ownership
    const amazonProfile = await this.prisma.amazonProfile.findFirst({
      where: {
        id: profileId,
        readerProfileId: readerProfile.id,
      },
    });

    if (!amazonProfile) {
      throw new NotFoundException('Amazon profile not found or does not belong to this reader');
    }

    await this.prisma.amazonProfile.delete({
      where: { id: profileId },
    });
  }

  /**
   * Map Prisma model to response DTO
   */
  private mapToResponse(readerProfile: any): ReaderProfileResponseDto {
    return {
      id: readerProfile.id,
      userId: readerProfile.userId,
      contentPreference: readerProfile.contentPreference,
      amazonProfiles: readerProfile.amazonProfiles.map((profile: any) => ({
        id: profile.id,
        profileUrl: profile.profileUrl,
        profileName: profile.profileName || undefined,
        isVerified: profile.isVerified,
        verifiedAt: profile.verifiedAt || undefined,
        createdAt: profile.createdAt,
      })),
      walletBalance: readerProfile.walletBalance.toNumber(),
      totalEarned: readerProfile.totalEarned.toNumber(),
      totalWithdrawn: readerProfile.totalWithdrawn.toNumber(),
      reviewsCompleted: readerProfile.reviewsCompleted,
      reviewsExpired: readerProfile.reviewsExpired,
      reviewsRejected: readerProfile.reviewsRejected,
      averageInternalRating: readerProfile.averageInternalRating?.toNumber() || undefined,
      reliabilityScore: readerProfile.reliabilityScore?.toNumber() || undefined,
      completionRate: readerProfile.completionRate?.toNumber() || undefined,
      reviewsRemovedByAmazon: readerProfile.reviewsRemovedByAmazon,
      removalRate: readerProfile.removalRate?.toNumber() || undefined,
      isActive: readerProfile.isActive,
      isFlagged: readerProfile.isFlagged,
      flagReason: readerProfile.flagReason || undefined,
      preferredGenres: readerProfile.preferredGenres,
      createdAt: readerProfile.createdAt,
      updatedAt: readerProfile.updatedAt,
    };
  }
}
