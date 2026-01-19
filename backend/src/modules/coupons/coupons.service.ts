import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import {
  CreateCouponDto,
  UpdateCouponDto,
  ValidateCouponDto,
  CouponResponseDto,
  CouponValidationResponseDto,
  CouponUsageStatsDto,
  CouponUsageDto,
  ManualApplyCouponDto,
} from './dto';
import { Prisma, Coupon } from '@prisma/client';
import { AuditService } from '@modules/audit/audit.service';

@Injectable()
export class CouponsService {
  private readonly logger = new Logger(CouponsService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  /**
   * Create a new coupon
   */
  async create(
    dto: CreateCouponDto,
    createdBy: string,
  ): Promise<CouponResponseDto> {
    // Validate coupon data
    this.validateCouponData(dto);

    // Check if code already exists
    const existing = await this.prisma.coupon.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (existing) {
      throw new ConflictException(`Coupon code '${dto.code}' already exists`);
    }

    // Create coupon
    const coupon = await this.prisma.coupon.create({
      data: {
        code: dto.code.toUpperCase(),
        type: dto.type,
        appliesTo: dto.appliesTo,
        discountPercent: dto.discountPercent
          ? new Prisma.Decimal(dto.discountPercent)
          : null,
        discountAmount: dto.discountAmount
          ? new Prisma.Decimal(dto.discountAmount)
          : null,
        minimumPurchase: dto.minimumPurchase
          ? new Prisma.Decimal(dto.minimumPurchase)
          : null,
        minimumCredits: dto.minimumCredits,
        maxUses: dto.maxUses,
        maxUsesPerUser: dto.maxUsesPerUser,
        isActive: dto.isActive,
        validFrom: new Date(dto.validFrom),
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
        createdBy,
        purpose: dto.purpose,
      },
    });

    return this.toCouponResponse(coupon);
  }

  /**
   * Get all coupons with optional filters
   */
  async findAll(filters?: {
    isActive?: boolean;
    appliesTo?: string;
  }): Promise<CouponResponseDto[]> {
    const where: Prisma.CouponWhereInput = {};

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.appliesTo) {
      where.appliesTo = filters.appliesTo as any;
    }

    const coupons = await this.prisma.coupon.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return coupons.map(this.toCouponResponse);
  }

  /**
   * Get a single coupon by ID
   */
  async findOne(id: string): Promise<CouponResponseDto> {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon with ID '${id}' not found`);
    }

    return this.toCouponResponse(coupon);
  }

  /**
   * Get a coupon by code
   */
  async findByCode(code: string): Promise<CouponResponseDto> {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon '${code}' not found`);
    }

    return this.toCouponResponse(coupon);
  }

  /**
   * Update a coupon
   */
  async update(
    id: string,
    dto: UpdateCouponDto,
  ): Promise<CouponResponseDto> {
    // Check if coupon exists
    await this.findOne(id);

    // Validate updated data
    if (Object.keys(dto).length > 0) {
      this.validateCouponData(dto as any);
    }

    // Update coupon
    const coupon = await this.prisma.coupon.update({
      where: { id },
      data: {
        ...(dto.type && { type: dto.type }),
        ...(dto.appliesTo && { appliesTo: dto.appliesTo }),
        ...(dto.discountPercent !== undefined && {
          discountPercent: dto.discountPercent
            ? new Prisma.Decimal(dto.discountPercent)
            : null,
        }),
        ...(dto.discountAmount !== undefined && {
          discountAmount: dto.discountAmount
            ? new Prisma.Decimal(dto.discountAmount)
            : null,
        }),
        ...(dto.minimumPurchase !== undefined && {
          minimumPurchase: dto.minimumPurchase
            ? new Prisma.Decimal(dto.minimumPurchase)
            : null,
        }),
        ...(dto.minimumCredits !== undefined && {
          minimumCredits: dto.minimumCredits,
        }),
        ...(dto.maxUses !== undefined && { maxUses: dto.maxUses }),
        ...(dto.maxUsesPerUser !== undefined && {
          maxUsesPerUser: dto.maxUsesPerUser,
        }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.validFrom && { validFrom: new Date(dto.validFrom) }),
        ...(dto.validUntil !== undefined && {
          validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
        }),
        ...(dto.purpose !== undefined && { purpose: dto.purpose }),
      },
    });

    return this.toCouponResponse(coupon);
  }

  /**
   * Delete a coupon (soft delete - deactivate)
   */
  async remove(id: string): Promise<void> {
    // Check if coupon exists
    await this.findOne(id);

    // Deactivate instead of hard delete to preserve usage history
    await this.prisma.coupon.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Validate a coupon for use
   */
  async validateCoupon(
    dto: ValidateCouponDto,
    userId?: string,
  ): Promise<CouponValidationResponseDto> {
    try {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: dto.code.toUpperCase() },
      });

      if (!coupon) {
        return {
          valid: false,
          error: 'Invalid coupon code',
        };
      }

      if (!coupon.isActive) {
        return {
          valid: false,
          error: 'This coupon is no longer active',
        };
      }

      const now = new Date();
      if (coupon.validFrom > now) {
        return {
          valid: false,
          error: 'This coupon is not yet valid',
        };
      }

      if (coupon.validUntil && coupon.validUntil < now) {
        return {
          valid: false,
          error: 'This coupon has expired',
        };
      }

      if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
        return {
          valid: false,
          error: 'This coupon has reached its maximum usage limit',
        };
      }

      // Check per-user usage limit
      if (userId) {
        const userUsageCount = await this.prisma.couponUsage.count({
          where: {
            couponId: coupon.id,
            userId,
          },
        });

        if (userUsageCount >= coupon.maxUsesPerUser) {
          return {
            valid: false,
            error: 'You have already used this coupon the maximum number of times',
          };
        }
      }

      // Check minimum purchase requirement
      if (
        dto.purchaseAmount &&
        coupon.minimumPurchase &&
        dto.purchaseAmount < coupon.minimumPurchase.toNumber()
      ) {
        return {
          valid: false,
          error: `Minimum purchase of $${coupon.minimumPurchase} required`,
        };
      }

      // Check minimum credits requirement
      if (
        dto.credits !== undefined &&
        coupon.minimumCredits &&
        dto.credits < coupon.minimumCredits
      ) {
        return {
          valid: false,
          error: `Minimum ${coupon.minimumCredits} credits required`,
        };
      }

      // Calculate discount if purchase amount provided
      let discountAmount: number | undefined;
      let finalPrice: number | undefined;

      if (dto.purchaseAmount) {
        if (coupon.type === 'PERCENTAGE' && coupon.discountPercent) {
          discountAmount =
            (dto.purchaseAmount * coupon.discountPercent.toNumber()) / 100;
          finalPrice = dto.purchaseAmount - discountAmount;
        } else if (coupon.type === 'FIXED_AMOUNT' && coupon.discountAmount) {
          discountAmount = coupon.discountAmount.toNumber();
          finalPrice = Math.max(0, dto.purchaseAmount - discountAmount);
        }
      }

      return {
        valid: true,
        coupon: this.toCouponResponse(coupon),
        discountAmount,
        finalPrice,
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Error validating coupon',
      };
    }
  }

  /**
   * Get coupon usage statistics
   */
  async getUsageStats(couponId: string): Promise<CouponUsageStatsDto> {
    const coupon = await this.findOne(couponId);

    const usages = await this.prisma.couponUsage.findMany({
      where: { couponId },
      orderBy: { usedAt: 'desc' },
    });

    const uniqueUsers = new Set(usages.map((u) => u.userId)).size;
    const totalDiscountGiven = usages.reduce(
      (sum, u) => sum + u.discountApplied.toNumber(),
      0,
    );

    // Calculate usage by date
    const usageByDate: Record<string, number> = {};
    usages.forEach((usage) => {
      const date = usage.usedAt.toISOString().split('T')[0];
      usageByDate[date] = (usageByDate[date] || 0) + 1;
    });

    // Get recent usages (last 10)
    const recentUsages: CouponUsageDto[] = usages.slice(0, 10).map((usage) => ({
      id: usage.id,
      couponId: usage.couponId,
      userId: usage.userId,
      userEmail: usage.userEmail,
      discountApplied: usage.discountApplied.toNumber(),
      usedAt: usage.usedAt,
      creditPurchaseId: usage.creditPurchaseId || undefined,
      keywordResearchId: usage.keywordResearchId || undefined,
    }));

    return {
      couponId,
      code: coupon.code,
      totalUses: usages.length,
      uniqueUsers,
      totalDiscountGiven,
      totalRevenue: 0, // This would need to be calculated from actual purchases
      usageByDate,
      recentUsages,
    };
  }

  /**
   * Manually apply a coupon to a user's order (admin only)
   */
  async manualApply(dto: ManualApplyCouponDto, adminId: string): Promise<void> {
    // Validate coupon exists and is valid
    const validation = await this.validateCoupon(
      { code: dto.couponCode },
      dto.userId,
    );

    if (!validation.valid) {
      throw new BadRequestException(validation.error || 'Invalid coupon');
    }

    const coupon = validation.coupon!;

    // Check if order exists
    if (dto.creditPurchaseId) {
      const purchase = await this.prisma.creditPurchase.findUnique({
        where: { id: dto.creditPurchaseId },
      });

      if (!purchase) {
        throw new NotFoundException('Credit purchase not found');
      }

      // Check if coupon already applied to this purchase
      const existingUsage = await this.prisma.couponUsage.findFirst({
        where: {
          couponId: coupon.id,
          creditPurchaseId: dto.creditPurchaseId,
        },
      });

      if (existingUsage) {
        throw new ConflictException('Coupon already applied to this purchase');
      }
    }

    if (dto.keywordResearchId) {
      const research = await this.prisma.keywordResearch.findUnique({
        where: { id: dto.keywordResearchId },
      });

      if (!research) {
        throw new NotFoundException('Keyword research not found');
      }

      const existingUsage = await this.prisma.couponUsage.findFirst({
        where: {
          couponId: coupon.id,
          keywordResearchId: dto.keywordResearchId,
        },
      });

      if (existingUsage) {
        throw new ConflictException('Coupon already applied to this research');
      }
    }

    // Get user email
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Calculate discount amount
    let discountApplied = 0;
    if (dto.creditPurchaseId) {
      const purchase = await this.prisma.creditPurchase.findUnique({
        where: { id: dto.creditPurchaseId },
      });
      if (purchase) {
        if (coupon.type === 'PERCENTAGE' && coupon.discountPercent) {
          discountApplied =
            (Number(purchase.amountPaid) * Number(coupon.discountPercent)) / 100;
        } else if (coupon.type === 'FIXED_AMOUNT' && coupon.discountAmount) {
          discountApplied = Number(coupon.discountAmount);
        }
      }
    }

    // Record coupon usage
    await this.prisma.couponUsage.create({
      data: {
        couponId: coupon.id,
        userId: dto.userId,
        userEmail: user.email,
        creditPurchaseId: dto.creditPurchaseId,
        keywordResearchId: dto.keywordResearchId,
        discountApplied: new Prisma.Decimal(discountApplied),
      },
    });

    // Increment usage count
    await this.prisma.coupon.update({
      where: { id: coupon.id },
      data: {
        currentUses: {
          increment: 1,
        },
      },
    });

    // Get admin user for audit logging
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    // Log admin action
    try {
      await this.auditService.logCouponManualApply(
        coupon.id,
        coupon.code,
        dto.userId,
        dto.creditPurchaseId || null,
        dto.keywordResearchId || null,
        discountApplied,
        dto.adminNote,
        adminId,
        admin?.email || 'unknown',
      );
    } catch (error) {
      // Log error but don't fail the operation
      this.logger.error(`Failed to log audit for manual coupon apply: ${error.message}`);
    }
  }

  /**
   * Validate coupon data
   */
  private validateCouponData(dto: Partial<CreateCouponDto>): void {
    // Validate PERCENTAGE type
    if (dto.type === 'PERCENTAGE') {
      if (!dto.discountPercent) {
        throw new BadRequestException(
          'discountPercent is required for PERCENTAGE type coupons',
        );
      }
      if (dto.discountAmount) {
        throw new BadRequestException(
          'discountAmount should not be set for PERCENTAGE type coupons',
        );
      }
    }

    // Validate FIXED_AMOUNT type
    if (dto.type === 'FIXED_AMOUNT') {
      if (!dto.discountAmount) {
        throw new BadRequestException(
          'discountAmount is required for FIXED_AMOUNT type coupons',
        );
      }
      if (dto.discountPercent) {
        throw new BadRequestException(
          'discountPercent should not be set for FIXED_AMOUNT type coupons',
        );
      }
    }

    // Validate FREE_ADDON type
    if (dto.type === 'FREE_ADDON') {
      if (dto.discountPercent || dto.discountAmount) {
        throw new BadRequestException(
          'FREE_ADDON type coupons should not have discount values',
        );
      }
    }

    // Validate date range
    if (dto.validFrom && dto.validUntil) {
      const from = new Date(dto.validFrom);
      const until = new Date(dto.validUntil);
      if (from >= until) {
        throw new BadRequestException('validUntil must be after validFrom');
      }
    }
  }

  /**
   * Convert Prisma Coupon to response DTO
   */
  private toCouponResponse(coupon: Coupon): CouponResponseDto {
    return new CouponResponseDto({
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      appliesTo: coupon.appliesTo,
      discountPercent: coupon.discountPercent?.toNumber(),
      discountAmount: coupon.discountAmount?.toNumber(),
      minimumPurchase: coupon.minimumPurchase?.toNumber(),
      minimumCredits: coupon.minimumCredits || undefined,
      maxUses: coupon.maxUses || undefined,
      maxUsesPerUser: coupon.maxUsesPerUser,
      currentUses: coupon.currentUses,
      isActive: coupon.isActive,
      validFrom: coupon.validFrom,
      validUntil: coupon.validUntil || undefined,
      createdBy: coupon.createdBy,
      purpose: coupon.purpose || undefined,
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt,
    });
  }
}
