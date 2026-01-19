import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PaymentIssueService } from '../services/payment-issue.service';
import {
  CreatePaymentIssueDto,
  ResolvePaymentIssueDto,
  ProcessRefundDto,
  UpdatePaymentIssueStatusDto,
  GetPaymentIssuesQueryDto,
  PaymentIssueResponseDto,
  PaymentIssueStatus,
  PaymentIssueType,
  PaymentIssuePriority,
} from '../dto/payment-issue.dto';

@ApiTags('Admin - Payment Issues')
@ApiBearerAuth()
@Controller('admin/payment-issues')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class PaymentIssueController {
  constructor(private readonly paymentIssueService: PaymentIssueService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payment issue' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payment issue created successfully',
    type: PaymentIssueResponseDto,
  })
  async createPaymentIssue(
    @Body() dto: CreatePaymentIssueDto,
    @Req() req: Request,
  ): Promise<PaymentIssueResponseDto> {
    return this.paymentIssueService.createPaymentIssue(dto, req.user!.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payment issues with optional filters' })
  @ApiQuery({ name: 'status', enum: PaymentIssueStatus, required: false })
  @ApiQuery({ name: 'type', enum: PaymentIssueType, required: false })
  @ApiQuery({ name: 'priority', enum: PaymentIssuePriority, required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of payment issues',
    type: [PaymentIssueResponseDto],
  })
  async getPaymentIssues(
    @Query() query: GetPaymentIssuesQueryDto,
  ): Promise<PaymentIssueResponseDto[]> {
    return this.paymentIssueService.getPaymentIssues(query);
  }

  @Get('open')
  @ApiOperation({ summary: 'Get all open payment issues' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of open payment issues',
    type: [PaymentIssueResponseDto],
  })
  async getOpenPaymentIssues(): Promise<PaymentIssueResponseDto[]> {
    return this.paymentIssueService.getOpenPaymentIssues();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get payment issue statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment issue statistics',
  })
  async getPaymentIssueStats() {
    return this.paymentIssueService.getPaymentIssueStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment issue by ID' })
  @ApiParam({ name: 'id', description: 'Payment issue ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment issue details',
    type: PaymentIssueResponseDto,
  })
  async getPaymentIssueById(
    @Param('id') issueId: string,
  ): Promise<PaymentIssueResponseDto> {
    return this.paymentIssueService.getPaymentIssueById(issueId);
  }

  @Put(':id/resolve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resolve a payment issue' })
  @ApiParam({ name: 'id', description: 'Payment issue ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment issue resolved',
    type: PaymentIssueResponseDto,
  })
  async resolvePaymentIssue(
    @Param('id') issueId: string,
    @Body() dto: ResolvePaymentIssueDto,
    @Req() req: Request,
  ): Promise<PaymentIssueResponseDto> {
    return this.paymentIssueService.resolvePaymentIssue(issueId, dto, req.user!.id);
  }

  @Put(':id/refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process a refund for a payment issue' })
  @ApiParam({ name: 'id', description: 'Payment issue ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Refund processed',
    type: PaymentIssueResponseDto,
  })
  async processRefund(
    @Param('id') issueId: string,
    @Body() dto: ProcessRefundDto,
    @Req() req: Request,
  ): Promise<PaymentIssueResponseDto> {
    return this.paymentIssueService.processRefund(issueId, dto, req.user!.id);
  }

  @Put(':id/reconcile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reconcile a payment issue' })
  @ApiParam({ name: 'id', description: 'Payment issue ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment reconciled',
    type: PaymentIssueResponseDto,
  })
  async reconcilePayment(
    @Param('id') issueId: string,
    @Body('notes') notes: string,
    @Req() req: Request,
  ): Promise<PaymentIssueResponseDto> {
    return this.paymentIssueService.reconcilePayment(issueId, notes, req.user!.id);
  }

  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update payment issue status' })
  @ApiParam({ name: 'id', description: 'Payment issue ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment issue status updated',
    type: PaymentIssueResponseDto,
  })
  async updatePaymentIssueStatus(
    @Param('id') issueId: string,
    @Body() dto: UpdatePaymentIssueStatusDto,
    @Req() req: Request,
  ): Promise<PaymentIssueResponseDto> {
    return this.paymentIssueService.updatePaymentIssueStatus(issueId, dto, req.user!.id);
  }
}
