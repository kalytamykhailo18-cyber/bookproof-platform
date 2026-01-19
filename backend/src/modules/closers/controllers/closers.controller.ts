import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  Req,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiProduces,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole, CustomPackageStatus, PaymentStatus } from '@prisma/client';
import { ClosersService } from '../services/closers.service';
import { InvoicePdfService } from '../services/invoice-pdf.service';
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
  GetInvoicesQueryDto,
  InvoiceResponseDto,
  InvoiceStatsDto,
} from '../dto/invoice.dto';
import {
  CloserProfileResponseDto,
  CloserDashboardStatsDto,
  SalesHistoryItemDto,
} from '../dto/closer-dashboard.dto';

@ApiTags('Closer Panel')
@ApiBearerAuth()
@Controller('closer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CLOSER)
export class ClosersController {
  constructor(
    private readonly closersService: ClosersService,
    private readonly invoicePdfService: InvoicePdfService,
  ) {}

  // ============================================
  // PROFILE & DASHBOARD
  // ============================================

  @Get('profile')
  @ApiOperation({ summary: 'Get closer profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Closer profile',
    type: CloserProfileResponseDto,
  })
  async getProfile(@Req() req: Request): Promise<CloserProfileResponseDto> {
    return this.closersService.getCloserProfile(req.user!.id);
  }

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dashboard statistics',
    type: CloserDashboardStatsDto,
  })
  async getDashboardStats(
    @Req() req: Request,
  ): Promise<CloserDashboardStatsDto> {
    return this.closersService.getDashboardStats(req.user!.id);
  }

  @Get('sales/history')
  @ApiOperation({ summary: 'Get sales history' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sales history',
    type: [SalesHistoryItemDto],
  })
  async getSalesHistory(
    @Req() req: Request,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<SalesHistoryItemDto[]> {
    return this.closersService.getSalesHistory(
      req.user!.id,
      limit ? Number(limit) : undefined,
      offset ? Number(offset) : undefined,
    );
  }

  // ============================================
  // CUSTOM PACKAGES
  // ============================================

  @Post('packages')
  @ApiOperation({ summary: 'Create a custom package' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Package created',
    type: CustomPackageResponseDto,
  })
  async createPackage(
    @Req() req: Request,
    @Body() dto: CreateCustomPackageDto,
  ): Promise<CustomPackageResponseDto> {
    return this.closersService.createCustomPackage(req.user!.id, dto);
  }

  @Get('packages')
  @ApiOperation({ summary: 'Get all packages' })
  @ApiQuery({ name: 'status', enum: CustomPackageStatus, required: false })
  @ApiQuery({ name: 'clientEmail', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of packages',
    type: [CustomPackageResponseDto],
  })
  async getPackages(
    @Req() req: Request,
    @Query() query: GetPackagesQueryDto,
  ): Promise<CustomPackageResponseDto[]> {
    return this.closersService.getPackages(req.user!.id, query);
  }

  @Get('packages/stats')
  @ApiOperation({ summary: 'Get package statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Package statistics',
    type: PackageStatsDto,
  })
  async getPackageStats(@Req() req: Request): Promise<PackageStatsDto> {
    return this.closersService.getPackageStats(req.user!.id);
  }

  @Get('packages/:id')
  @ApiOperation({ summary: 'Get package by ID' })
  @ApiParam({ name: 'id', description: 'Package ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Package details',
    type: CustomPackageResponseDto,
  })
  async getPackageById(
    @Req() req: Request,
    @Param('id') packageId: string,
  ): Promise<CustomPackageResponseDto> {
    return this.closersService.getPackageById(req.user!.id, packageId);
  }

  @Put('packages/:id')
  @ApiOperation({ summary: 'Update a package' })
  @ApiParam({ name: 'id', description: 'Package ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Package updated',
    type: CustomPackageResponseDto,
  })
  async updatePackage(
    @Req() req: Request,
    @Param('id') packageId: string,
    @Body() dto: UpdateCustomPackageDto,
  ): Promise<CustomPackageResponseDto> {
    return this.closersService.updateCustomPackage(req.user!.id, packageId, dto);
  }

  @Post('packages/:id/send')
  @ApiOperation({ summary: 'Send package to client (generate payment link)' })
  @ApiParam({ name: 'id', description: 'Package ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Package sent with payment link',
    type: CustomPackageResponseDto,
  })
  async sendPackage(
    @Req() req: Request,
    @Param('id') packageId: string,
    @Body() dto: SendPackageDto,
  ): Promise<CustomPackageResponseDto> {
    return this.closersService.sendPackage(req.user!.id, packageId, dto);
  }

  @Delete('packages/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a draft package' })
  @ApiParam({ name: 'id', description: 'Package ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Package deleted',
  })
  async deletePackage(
    @Req() req: Request,
    @Param('id') packageId: string,
  ): Promise<void> {
    return this.closersService.deletePackage(req.user!.id, packageId);
  }

  // ============================================
  // INVOICES
  // ============================================

  @Post('invoices')
  @ApiOperation({ summary: 'Create an invoice' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Invoice created',
    type: InvoiceResponseDto,
  })
  async createInvoice(
    @Req() req: Request,
    @Body() dto: CreateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    return this.closersService.createInvoice(req.user!.id, dto);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Get all invoices' })
  @ApiQuery({ name: 'status', enum: PaymentStatus, required: false })
  @ApiQuery({ name: 'clientEmail', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of invoices',
    type: [InvoiceResponseDto],
  })
  async getInvoices(
    @Req() req: Request,
    @Query() query: GetInvoicesQueryDto,
  ): Promise<InvoiceResponseDto[]> {
    return this.closersService.getInvoices(req.user!.id, query);
  }

  @Get('invoices/stats')
  @ApiOperation({ summary: 'Get invoice statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invoice statistics',
    type: InvoiceStatsDto,
  })
  async getInvoiceStats(@Req() req: Request): Promise<InvoiceStatsDto> {
    return this.closersService.getInvoiceStats(req.user!.id);
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invoice details',
    type: InvoiceResponseDto,
  })
  async getInvoiceById(
    @Req() req: Request,
    @Param('id') invoiceId: string,
  ): Promise<InvoiceResponseDto> {
    return this.closersService.getInvoiceById(req.user!.id, invoiceId);
  }

  @Get('packages/:id/invoice-pdf')
  @ApiOperation({ summary: 'Download invoice PDF for a package' })
  @ApiParam({ name: 'id', description: 'Package ID' })
  @ApiProduces('application/pdf')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invoice PDF file',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async downloadPackageInvoicePdf(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('id') packageId: string,
  ): Promise<StreamableFile> {
    // Get the package first to verify ownership
    const pkg = await this.closersService.getPackageById(req.user!.id, packageId);

    // Get closer info
    const closerUser = await this.closersService.getCloserProfile(req.user!.id);

    // Generate invoice number for the PDF
    const invoiceNumber = `INV-${pkg.id.slice(-8).toUpperCase()}`;

    // Generate the PDF
    const pdfBuffer = await this.invoicePdfService.generateInvoicePdf({
      invoiceNumber,
      clientName: pkg.clientName,
      clientEmail: pkg.clientEmail,
      clientCompany: pkg.clientCompany,
      packageName: pkg.packageName,
      packageDescription: pkg.description,
      credits: pkg.credits,
      price: pkg.price,
      currency: pkg.currency,
      validityDays: pkg.validityDays,
      specialTerms: pkg.specialTerms,
      createdAt: new Date(pkg.createdAt),
      closerName: closerUser.userName,
      closerEmail: closerUser.userEmail,
    });

    // Set headers for PDF download
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${invoiceNumber}.pdf"`,
    });

    return new StreamableFile(pdfBuffer);
  }
}
