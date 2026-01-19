import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { EmailService } from '../../email/email.service';
import { ConfigService } from '@nestjs/config';
import { CustomPackageStatus, PaymentStatus, UserRole, EmailType } from '@prisma/client';
import { randomBytes } from 'crypto';
import {
  CreateCustomPackageDto,
  UpdateCustomPackageDto,
  SendPackageDto,
  GetPackagesQueryDto,
  CustomPackageResponseDto,
  PackageStatsDto,
} from '../dto/custom-package.dto';
import {
  CreateInvoiceDto,
  UpdateInvoiceDto,
  MarkInvoicePaidDto,
  GetInvoicesQueryDto,
  InvoiceResponseDto,
  InvoiceStatsDto,
} from '../dto/invoice.dto';
import {
  CloserProfileResponseDto,
  CloserDashboardStatsDto,
  SalesHistoryItemDto,
  RecentActivityDto,
} from '../dto/closer-dashboard.dto';

@Injectable()
export class ClosersService {
  private appUrl: string;

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {
    this.appUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  // ============================================
  // CLOSER PROFILE
  // ============================================

  /**
   * Get closer profile for the current user
   */
  async getCloserProfile(userId: string): Promise<CloserProfileResponseDto> {
    const profile = await this.prisma.closerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Closer profile not found');
    }

    return this.mapCloserProfileToDto(profile);
  }

  /**
   * Get dashboard stats for closer
   */
  async getDashboardStats(userId: string): Promise<CloserDashboardStatsDto> {
    const profile = await this.prisma.closerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Closer profile not found');
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get packages for metrics
    const [
      packagesThisMonth,
      packagesLastMonth,
      paidPackagesThisMonth,
      paidPackagesLastMonth,
      pipelinePackages,
    ] = await Promise.all([
      this.prisma.customPackage.findMany({
        where: {
          closerProfileId: profile.id,
          createdAt: { gte: startOfMonth },
        },
      }),
      this.prisma.customPackage.findMany({
        where: {
          closerProfileId: profile.id,
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
      this.prisma.customPackage.findMany({
        where: {
          closerProfileId: profile.id,
          status: CustomPackageStatus.PAID,
          updatedAt: { gte: startOfMonth },
        },
      }),
      this.prisma.customPackage.findMany({
        where: {
          closerProfileId: profile.id,
          status: CustomPackageStatus.PAID,
          updatedAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
      this.prisma.customPackage.findMany({
        where: {
          closerProfileId: profile.id,
          status: { in: [CustomPackageStatus.DRAFT, CustomPackageStatus.SENT, CustomPackageStatus.VIEWED] },
        },
      }),
    ]);

    const salesThisMonth = paidPackagesThisMonth.reduce(
      (sum, p) => sum + Number(p.price),
      0,
    );
    const salesLastMonth = paidPackagesLastMonth.reduce(
      (sum, p) => sum + Number(p.price),
      0,
    );

    const salesGrowth = salesLastMonth > 0
      ? ((salesThisMonth - salesLastMonth) / salesLastMonth) * 100
      : salesThisMonth > 0 ? 100 : 0;

    const sentPackagesThisMonth = packagesThisMonth.filter(
      (p) => p.status !== CustomPackageStatus.DRAFT,
    ).length;

    const conversionRate = sentPackagesThisMonth > 0
      ? (paidPackagesThisMonth.length / sentPackagesThisMonth) * 100
      : 0;

    const totalPaidPackages = await this.prisma.customPackage.count({
      where: {
        closerProfileId: profile.id,
        status: CustomPackageStatus.PAID,
      },
    });

    const allPaidPackages = await this.prisma.customPackage.findMany({
      where: {
        closerProfileId: profile.id,
        status: CustomPackageStatus.PAID,
      },
    });

    const averageDealSize = totalPaidPackages > 0
      ? allPaidPackages.reduce((sum, p) => sum + Number(p.price), 0) / totalPaidPackages
      : 0;

    const pipelineValue = pipelinePackages.reduce(
      (sum, p) => sum + Number(p.price),
      0,
    );

    // Commission calculation (if enabled)
    const pendingCommission = profile.commissionEnabled && profile.commissionRate
      ? paidPackagesThisMonth.reduce(
          (sum, p) => sum + (Number(p.price) * Number(profile.commissionRate!) / 100),
          0,
        )
      : 0;

    return {
      salesThisMonth,
      salesLastMonth,
      salesGrowth,
      packagesCreatedThisMonth: packagesThisMonth.length,
      packagesSentThisMonth: sentPackagesThisMonth,
      packagesPaidThisMonth: paidPackagesThisMonth.length,
      conversionRate,
      averageDealSize,
      packagesInPipeline: pipelinePackages.length,
      pipelineValue,
      pendingCommission,
      commissionThisMonth: pendingCommission,
    };
  }

  /**
   * Get sales history for closer
   */
  async getSalesHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<SalesHistoryItemDto[]> {
    const profile = await this.prisma.closerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Closer profile not found');
    }

    const paidPackages = await this.prisma.customPackage.findMany({
      where: {
        closerProfileId: profile.id,
        status: CustomPackageStatus.PAID,
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        invoice: true,
      },
    });

    return paidPackages.map((pkg) => ({
      id: pkg.id,
      type: 'PACKAGE' as const,
      clientName: pkg.clientName,
      clientEmail: pkg.clientEmail,
      clientCompany: pkg.clientCompany || undefined,
      amount: Number(pkg.price),
      currency: pkg.currency,
      credits: pkg.credits,
      status: pkg.status,
      date: pkg.updatedAt,
      accountCreated: pkg.invoice?.accountCreated || false,
    }));
  }

  // ============================================
  // CUSTOM PACKAGES
  // ============================================

  /**
   * Create a new custom package
   */
  async createCustomPackage(
    userId: string,
    dto: CreateCustomPackageDto,
  ): Promise<CustomPackageResponseDto> {
    const profile = await this.prisma.closerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Closer profile not found');
    }

    if (!profile.isActive) {
      throw new ForbiddenException('Closer profile is not active');
    }

    const pkg = await this.prisma.customPackage.create({
      data: {
        closerProfileId: profile.id,
        packageName: dto.packageName,
        description: dto.description,
        credits: dto.credits,
        price: dto.price,
        currency: dto.currency || 'USD',
        validityDays: dto.validityDays,
        specialTerms: dto.specialTerms,
        internalNotes: dto.internalNotes,
        clientName: dto.clientName,
        clientEmail: dto.clientEmail,
        clientCompany: dto.clientCompany,
        status: CustomPackageStatus.DRAFT,
      },
    });

    // Audit log
    await this.auditService.logAdminAction({
      action: 'closer.package_created',
      entity: 'CustomPackage',
      entityId: pkg.id,
      userId,
      userEmail: '',
      userRole: UserRole.CLOSER,
      description: `Custom package created: ${dto.packageName} for ${dto.clientName}`,
      changes: {
        packageName: dto.packageName,
        credits: dto.credits,
        price: dto.price,
        clientEmail: dto.clientEmail,
      },
    });

    return this.mapPackageToDto(pkg);
  }

  /**
   * Update a custom package
   */
  async updateCustomPackage(
    userId: string,
    packageId: string,
    dto: UpdateCustomPackageDto,
  ): Promise<CustomPackageResponseDto> {
    const profile = await this.prisma.closerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Closer profile not found');
    }

    const pkg = await this.prisma.customPackage.findUnique({
      where: { id: packageId },
    });

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    if (pkg.closerProfileId !== profile.id) {
      throw new ForbiddenException('You can only update your own packages');
    }

    if (pkg.status === CustomPackageStatus.PAID) {
      throw new BadRequestException('Cannot update a paid package');
    }

    const updatedPkg = await this.prisma.customPackage.update({
      where: { id: packageId },
      data: {
        ...(dto.packageName && { packageName: dto.packageName }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.credits && { credits: dto.credits }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.currency && { currency: dto.currency }),
        ...(dto.validityDays && { validityDays: dto.validityDays }),
        ...(dto.specialTerms !== undefined && { specialTerms: dto.specialTerms }),
        ...(dto.internalNotes !== undefined && { internalNotes: dto.internalNotes }),
        ...(dto.clientName && { clientName: dto.clientName }),
        ...(dto.clientEmail && { clientEmail: dto.clientEmail }),
        ...(dto.clientCompany !== undefined && { clientCompany: dto.clientCompany }),
      },
    });

    // Audit log
    await this.auditService.logAdminAction({
      action: 'closer.package_updated',
      entity: 'CustomPackage',
      entityId: packageId,
      userId,
      userEmail: '',
      userRole: UserRole.CLOSER,
      description: `Custom package updated: ${updatedPkg.packageName}`,
      changes: dto,
    });

    return this.mapPackageToDto(updatedPkg);
  }

  /**
   * Get packages for the closer
   */
  async getPackages(
    userId: string,
    query: GetPackagesQueryDto,
  ): Promise<CustomPackageResponseDto[]> {
    const profile = await this.prisma.closerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Closer profile not found');
    }

    const where: any = { closerProfileId: profile.id };

    if (query.status) {
      where.status = query.status;
    }
    if (query.clientEmail) {
      where.clientEmail = query.clientEmail;
    }

    const packages = await this.prisma.customPackage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: query.limit || 50,
      skip: query.offset || 0,
    });

    return packages.map((p) => this.mapPackageToDto(p));
  }

  /**
   * Get package by ID
   */
  async getPackageById(
    userId: string,
    packageId: string,
  ): Promise<CustomPackageResponseDto> {
    const profile = await this.prisma.closerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Closer profile not found');
    }

    const pkg = await this.prisma.customPackage.findUnique({
      where: { id: packageId },
    });

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    if (pkg.closerProfileId !== profile.id) {
      throw new ForbiddenException('You can only view your own packages');
    }

    return this.mapPackageToDto(pkg);
  }

  /**
   * Send package to client (generate payment link)
   */
  async sendPackage(
    userId: string,
    packageId: string,
    dto: SendPackageDto,
  ): Promise<CustomPackageResponseDto> {
    const profile = await this.prisma.closerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Closer profile not found');
    }

    const pkg = await this.prisma.customPackage.findUnique({
      where: { id: packageId },
    });

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    if (pkg.closerProfileId !== profile.id) {
      throw new ForbiddenException('You can only send your own packages');
    }

    if (pkg.status === CustomPackageStatus.PAID) {
      throw new BadRequestException('Package is already paid');
    }

    // Generate unique payment link token
    const token = randomBytes(32).toString('hex');
    const paymentLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/custom/${token}`;
    const expirationDays = dto.expirationDays || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    const updatedPkg = await this.prisma.customPackage.update({
      where: { id: packageId },
      data: {
        status: CustomPackageStatus.SENT,
        paymentLink,
        paymentLinkExpiresAt: expiresAt,
        sentAt: new Date(),
      },
    });

    // Get closer user info for email
    const closerUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    // Send email to client with payment link
    try {
      await this.emailService.sendTemplatedEmail(
        pkg.clientEmail,
        EmailType.CLOSER_PACKAGE_SENT_TO_CLIENT,
        {
          userName: pkg.clientName,
          clientCompany: pkg.clientCompany || undefined,
          packageName: pkg.packageName,
          packageDescription: pkg.description || undefined,
          credits: pkg.credits,
          price: Number(pkg.price),
          currency: pkg.currency,
          validityDays: pkg.validityDays,
          specialTerms: pkg.specialTerms || undefined,
          paymentLink,
          expirationDate: expiresAt,
          closerName: closerUser?.name || 'Your Account Executive',
          closerEmail: closerUser?.email || '',
          customMessage: dto.customMessage || undefined,
        },
        undefined,
        'EN',
      );
    } catch (error) {
      console.error('Failed to send package email to client:', error);
      // Don't throw - the package is still sent, just email failed
    }

    // Audit log
    await this.auditService.logAdminAction({
      action: 'closer.package_sent',
      entity: 'CustomPackage',
      entityId: packageId,
      userId,
      userEmail: '',
      userRole: UserRole.CLOSER,
      description: `Custom package sent to ${pkg.clientEmail}`,
      changes: {
        paymentLink,
        expiresAt,
        customMessage: dto.customMessage,
      },
    });

    return this.mapPackageToDto(updatedPkg);
  }

  /**
   * Delete a draft package
   */
  async deletePackage(userId: string, packageId: string): Promise<void> {
    const profile = await this.prisma.closerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Closer profile not found');
    }

    const pkg = await this.prisma.customPackage.findUnique({
      where: { id: packageId },
    });

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    if (pkg.closerProfileId !== profile.id) {
      throw new ForbiddenException('You can only delete your own packages');
    }

    if (pkg.status !== CustomPackageStatus.DRAFT) {
      throw new BadRequestException('Can only delete draft packages');
    }

    await this.prisma.customPackage.delete({
      where: { id: packageId },
    });

    // Audit log
    await this.auditService.logAdminAction({
      action: 'closer.package_deleted',
      entity: 'CustomPackage',
      entityId: packageId,
      userId,
      userEmail: '',
      userRole: UserRole.CLOSER,
      description: `Custom package deleted: ${pkg.packageName}`,
      changes: {},
    });
  }

  /**
   * Get package statistics
   */
  async getPackageStats(userId: string): Promise<PackageStatsDto> {
    const profile = await this.prisma.closerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Closer profile not found');
    }

    const [counts, paidPackages] = await Promise.all([
      this.prisma.customPackage.groupBy({
        by: ['status'],
        where: { closerProfileId: profile.id },
        _count: { status: true },
      }),
      this.prisma.customPackage.findMany({
        where: {
          closerProfileId: profile.id,
          status: CustomPackageStatus.PAID,
        },
        select: { price: true, credits: true },
      }),
    ]);

    const statusCounts = counts.reduce(
      (acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      },
      {} as Record<string, number>,
    );

    const totalRevenue = paidPackages.reduce(
      (sum, p) => sum + Number(p.price),
      0,
    );
    const totalCreditsSold = paidPackages.reduce(
      (sum, p) => sum + p.credits,
      0,
    );

    return {
      totalPackages: Object.values(statusCounts).reduce((a, b) => a + b, 0),
      draft: statusCounts[CustomPackageStatus.DRAFT] || 0,
      sent: statusCounts[CustomPackageStatus.SENT] || 0,
      viewed: statusCounts[CustomPackageStatus.VIEWED] || 0,
      paid: statusCounts[CustomPackageStatus.PAID] || 0,
      expired: statusCounts[CustomPackageStatus.EXPIRED] || 0,
      cancelled: statusCounts[CustomPackageStatus.CANCELLED] || 0,
      totalRevenue,
      totalCreditsSold,
    };
  }

  // ============================================
  // INVOICES
  // ============================================

  /**
   * Create an invoice (typically linked to a custom package)
   */
  async createInvoice(
    userId: string,
    dto: CreateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    const profile = await this.prisma.closerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Closer profile not found');
    }

    // Generate unique invoice number
    const invoiceNumber = `INV-${Date.now()}-${randomBytes(4).toString('hex').toUpperCase()}`;

    // Generate payment link
    const token = randomBytes(32).toString('hex');
    const paymentLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/invoice/${token}`;

    const invoice = await this.prisma.invoice.create({
      data: {
        closerProfileId: profile.id,
        customPackageId: dto.customPackageId,
        invoiceNumber,
        amount: dto.amount,
        currency: dto.currency || 'USD',
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        paymentLink,
        paymentStatus: PaymentStatus.PENDING,
      },
    });

    // Audit log
    await this.auditService.logAdminAction({
      action: 'closer.invoice_created',
      entity: 'Invoice',
      entityId: invoice.id,
      userId,
      userEmail: '',
      userRole: UserRole.CLOSER,
      description: `Invoice created: ${invoiceNumber}`,
      changes: {
        amount: dto.amount,
        clientEmail: dto.clientEmail,
        customPackageId: dto.customPackageId,
      },
    });

    return this.mapInvoiceToDto(invoice, dto.clientName, dto.clientEmail);
  }

  /**
   * Get invoices for the closer
   */
  async getInvoices(
    userId: string,
    query: GetInvoicesQueryDto,
  ): Promise<InvoiceResponseDto[]> {
    const profile = await this.prisma.closerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Closer profile not found');
    }

    const where: any = { closerProfileId: profile.id };

    if (query.status) {
      where.paymentStatus = query.status;
    }

    const invoices = await this.prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: query.limit || 50,
      skip: query.offset || 0,
      include: {
        customPackage: {
          select: {
            clientName: true,
            clientEmail: true,
          },
        },
      },
    });

    return invoices.map((inv) =>
      this.mapInvoiceToDto(
        inv,
        inv.customPackage?.clientName,
        inv.customPackage?.clientEmail,
      ),
    );
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(
    userId: string,
    invoiceId: string,
  ): Promise<InvoiceResponseDto> {
    const profile = await this.prisma.closerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Closer profile not found');
    }

    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customPackage: {
          select: {
            clientName: true,
            clientEmail: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.closerProfileId !== profile.id) {
      throw new ForbiddenException('You can only view your own invoices');
    }

    return this.mapInvoiceToDto(
      invoice,
      invoice.customPackage?.clientName,
      invoice.customPackage?.clientEmail,
    );
  }

  /**
   * Get invoice statistics
   */
  async getInvoiceStats(userId: string): Promise<InvoiceStatsDto> {
    const profile = await this.prisma.closerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Closer profile not found');
    }

    const [counts, pendingInvoices, completedInvoices] = await Promise.all([
      this.prisma.invoice.groupBy({
        by: ['paymentStatus'],
        where: { closerProfileId: profile.id },
        _count: { paymentStatus: true },
      }),
      this.prisma.invoice.findMany({
        where: {
          closerProfileId: profile.id,
          paymentStatus: PaymentStatus.PENDING,
        },
        select: { amount: true },
      }),
      this.prisma.invoice.findMany({
        where: {
          closerProfileId: profile.id,
          paymentStatus: PaymentStatus.COMPLETED,
        },
        select: { amount: true },
      }),
    ]);

    const statusCounts = counts.reduce(
      (acc, item) => {
        acc[item.paymentStatus] = item._count.paymentStatus;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalInvoices: Object.values(statusCounts).reduce((a, b) => a + b, 0),
      pending: statusCounts[PaymentStatus.PENDING] || 0,
      completed: statusCounts[PaymentStatus.COMPLETED] || 0,
      failed: statusCounts[PaymentStatus.FAILED] || 0,
      refunded: statusCounts[PaymentStatus.REFUNDED] || 0,
      totalPending: pendingInvoices.reduce((sum, i) => sum + Number(i.amount), 0),
      totalCollected: completedInvoices.reduce(
        (sum, i) => sum + Number(i.amount),
        0,
      ),
    };
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private mapCloserProfileToDto(profile: any): CloserProfileResponseDto {
    return {
      id: profile.id,
      userId: profile.userId,
      totalSales: Number(profile.totalSales),
      totalClients: profile.totalClients,
      totalPackagesSold: profile.totalPackagesSold,
      commissionEnabled: profile.commissionEnabled,
      commissionRate: profile.commissionRate
        ? Number(profile.commissionRate)
        : undefined,
      commissionEarned: Number(profile.commissionEarned),
      commissionPaid: Number(profile.commissionPaid),
      isActive: profile.isActive,
      conversionRate: profile.conversionRate
        ? Number(profile.conversionRate)
        : undefined,
      averagePackageSize: profile.averagePackageSize
        ? Number(profile.averagePackageSize)
        : undefined,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      userName: profile.user?.name,
      userEmail: profile.user?.email,
    };
  }

  private mapPackageToDto(pkg: any): CustomPackageResponseDto {
    return {
      id: pkg.id,
      closerProfileId: pkg.closerProfileId,
      packageName: pkg.packageName,
      description: pkg.description || undefined,
      credits: pkg.credits,
      price: Number(pkg.price),
      currency: pkg.currency,
      validityDays: pkg.validityDays,
      specialTerms: pkg.specialTerms || undefined,
      internalNotes: pkg.internalNotes || undefined,
      clientName: pkg.clientName,
      clientEmail: pkg.clientEmail,
      clientCompany: pkg.clientCompany || undefined,
      status: pkg.status,
      paymentLink: pkg.paymentLink || undefined,
      paymentLinkExpiresAt: pkg.paymentLinkExpiresAt || undefined,
      sentAt: pkg.sentAt || undefined,
      viewedAt: pkg.viewedAt || undefined,
      viewCount: pkg.viewCount,
      createdAt: pkg.createdAt,
      updatedAt: pkg.updatedAt,
    };
  }

  private mapInvoiceToDto(
    invoice: any,
    clientName?: string,
    clientEmail?: string,
  ): InvoiceResponseDto {
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      closerProfileId: invoice.closerProfileId || undefined,
      authorProfileId: invoice.authorProfileId || undefined,
      customPackageId: invoice.customPackageId || undefined,
      amount: Number(invoice.amount),
      currency: invoice.currency,
      description: invoice.description || undefined,
      dueDate: invoice.dueDate || undefined,
      paymentLink: invoice.paymentLink || undefined,
      paymentStatus: invoice.paymentStatus,
      paidAt: invoice.paidAt || undefined,
      stripePaymentId: invoice.stripePaymentId || undefined,
      paymentMethod: invoice.paymentMethod || undefined,
      accountCreated: invoice.accountCreated,
      accountCreatedAt: invoice.accountCreatedAt || undefined,
      autoCreatedUserId: invoice.autoCreatedUserId || undefined,
      pdfUrl: invoice.pdfUrl || undefined,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      clientName,
      clientEmail,
    };
  }
}
