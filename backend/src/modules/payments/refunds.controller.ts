import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole, RefundRequestStatus } from '@prisma/client';
import {
  RefundsService,
  CreateRefundRequestInput,
  AdminRefundDecisionInput,
  RefundRequestResponse,
  RefundEligibilityResponse,
} from './services/refunds.service';
import {
  CreateRefundRequestDto,
  AdminRefundDecisionDto,
  RefundRequestResponseDto,
  RefundEligibilityDto,
} from './dto/refund.dto';

@ApiTags('Refunds')
@Controller('refunds')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  // ==========================================
  // AUTHOR ENDPOINTS
  // ==========================================

  @Get('eligibility/:creditPurchaseId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AUTHOR)
  @ApiOperation({ summary: 'Check refund eligibility for a purchase' })
  @ApiResponse({ status: 200, description: 'Eligibility check result', type: RefundEligibilityDto })
  @ApiResponse({ status: 404, description: 'Purchase not found' })
  async checkEligibility(
    @Param('creditPurchaseId') creditPurchaseId: string,
    @Req() req: Request,
  ): Promise<RefundEligibilityResponse> {
    return this.refundsService.checkEligibility(creditPurchaseId, req.user!.authorProfileId!);
  }

  @Post('request')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AUTHOR)
  @ApiOperation({ summary: 'Create a refund request' })
  @ApiResponse({ status: 201, description: 'Refund request created', type: RefundRequestResponseDto })
  @ApiResponse({ status: 400, description: 'Not eligible for refund or validation error' })
  async createRequest(
    @Body() dto: CreateRefundRequestDto,
    @Req() req: Request,
  ): Promise<RefundRequestResponse> {
    const input: CreateRefundRequestInput = {
      creditPurchaseId: dto.creditPurchaseId,
      reason: dto.reason as any,
      explanation: dto.explanation,
    };
    return this.refundsService.createRequest(req.user!.authorProfileId!, input);
  }

  @Get('requests')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AUTHOR)
  @ApiOperation({ summary: 'Get all refund requests for the current author' })
  @ApiResponse({ status: 200, description: 'List of refund requests', type: [RefundRequestResponseDto] })
  async getMyRequests(@Req() req: Request): Promise<RefundRequestResponse[]> {
    return this.refundsService.getAuthorRequests(req.user!.authorProfileId!);
  }

  @Get('requests/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AUTHOR)
  @ApiOperation({ summary: 'Get a specific refund request' })
  @ApiResponse({ status: 200, description: 'Refund request details', type: RefundRequestResponseDto })
  @ApiResponse({ status: 404, description: 'Refund request not found' })
  async getRequest(
    @Param('id') requestId: string,
    @Req() req: Request,
  ): Promise<RefundRequestResponse> {
    return this.refundsService.getRequest(requestId, req.user!.authorProfileId!);
  }

  @Delete('requests/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AUTHOR)
  @ApiOperation({ summary: 'Cancel a pending refund request' })
  @ApiResponse({ status: 200, description: 'Request cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Request cannot be cancelled (not pending)' })
  @ApiResponse({ status: 404, description: 'Refund request not found' })
  async cancelRequest(
    @Param('id') requestId: string,
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    await this.refundsService.cancelRequest(requestId, req.user!.authorProfileId!);
    return { success: true };
  }

  // ==========================================
  // ADMIN ENDPOINTS
  // ==========================================

  @Get('admin/requests')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all refund requests (admin)' })
  @ApiQuery({ name: 'status', required: false, enum: RefundRequestStatus })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of refund requests with total count' })
  async getAllRequests(
    @Query('status') status?: RefundRequestStatus,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<{ requests: RefundRequestResponse[]; total: number }> {
    return this.refundsService.getAllRequests({
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('admin/requests/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a specific refund request (admin)' })
  @ApiResponse({ status: 200, description: 'Refund request details', type: RefundRequestResponseDto })
  @ApiResponse({ status: 404, description: 'Refund request not found' })
  async getRequestAdmin(@Param('id') requestId: string): Promise<RefundRequestResponse> {
    return this.refundsService.getRequest(requestId);
  }

  @Patch('admin/requests/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Process a refund request (approve/reject)' })
  @ApiResponse({ status: 200, description: 'Request processed successfully', type: RefundRequestResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid decision or request already processed' })
  @ApiResponse({ status: 404, description: 'Refund request not found' })
  async processRequest(
    @Param('id') requestId: string,
    @Body() dto: AdminRefundDecisionDto,
    @Req() req: Request,
  ): Promise<RefundRequestResponse> {
    const input: AdminRefundDecisionInput = {
      decision: dto.decision,
      adminNotes: dto.adminNotes,
      refundAmount: dto.refundAmount,
    };
    return this.refundsService.processRequest(requestId, req.user!.id, input);
  }
}
