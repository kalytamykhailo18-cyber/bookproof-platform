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
import { DisputeService } from '../services/dispute.service';
import {
  CreateDisputeDto,
  ResolveDisputeDto,
  EscalateDisputeDto,
  UpdateDisputeStatusDto,
  GetDisputesQueryDto,
  DisputeResponseDto,
  DisputeStatus,
  DisputeType,
  DisputePriority,
  FileAppealDto,
  ResolveAppealDto,
  SlaStatsResponseDto,
} from '../dto/dispute.dto';

@ApiTags('Admin - Disputes')
@ApiBearerAuth()
@Controller('admin/disputes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.AUTHOR, UserRole.READER)
  @ApiOperation({ summary: 'Create a new dispute' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Dispute created successfully',
    type: DisputeResponseDto,
  })
  async createDispute(
    @Body() dto: CreateDisputeDto,
    @Req() req: Request,
  ): Promise<DisputeResponseDto> {
    return this.disputeService.createDispute(dto, req.user!.id, req.user!.role);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all disputes with optional filters' })
  @ApiQuery({ name: 'status', enum: DisputeStatus, required: false })
  @ApiQuery({ name: 'type', enum: DisputeType, required: false })
  @ApiQuery({ name: 'priority', enum: DisputePriority, required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of disputes',
    type: [DisputeResponseDto],
  })
  async getDisputes(
    @Query() query: GetDisputesQueryDto,
  ): Promise<DisputeResponseDto[]> {
    return this.disputeService.getDisputes(query);
  }

  @Get('open')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all open disputes' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of open disputes',
    type: [DisputeResponseDto],
  })
  async getOpenDisputes(): Promise<DisputeResponseDto[]> {
    return this.disputeService.getOpenDisputes();
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get dispute statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dispute statistics',
  })
  async getDisputeStats() {
    return this.disputeService.getDisputeStats();
  }

  @Get('sla/stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get SLA compliance statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'SLA statistics',
    type: SlaStatsResponseDto,
  })
  async getSlaStats(): Promise<SlaStatsResponseDto> {
    return this.disputeService.getSlaStats();
  }

  @Get('user/:userId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get disputes by user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User disputes',
    type: [DisputeResponseDto],
  })
  async getDisputesByUser(
    @Param('userId') userId: string,
  ): Promise<DisputeResponseDto[]> {
    return this.disputeService.getDisputesByUser(userId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get dispute by ID' })
  @ApiParam({ name: 'id', description: 'Dispute ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dispute details',
    type: DisputeResponseDto,
  })
  async getDisputeById(
    @Param('id') disputeId: string,
  ): Promise<DisputeResponseDto> {
    return this.disputeService.getDisputeById(disputeId);
  }

  @Put(':id/resolve')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resolve a dispute' })
  @ApiParam({ name: 'id', description: 'Dispute ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dispute resolved',
    type: DisputeResponseDto,
  })
  async resolveDispute(
    @Param('id') disputeId: string,
    @Body() dto: ResolveDisputeDto,
    @Req() req: Request,
  ): Promise<DisputeResponseDto> {
    return this.disputeService.resolveDispute(disputeId, dto, req.user!.id);
  }

  @Put(':id/escalate')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Escalate a dispute' })
  @ApiParam({ name: 'id', description: 'Dispute ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dispute escalated',
    type: DisputeResponseDto,
  })
  async escalateDispute(
    @Param('id') disputeId: string,
    @Body() dto: EscalateDisputeDto,
    @Req() req: Request,
  ): Promise<DisputeResponseDto> {
    return this.disputeService.escalateDispute(disputeId, dto, req.user!.id);
  }

  @Put(':id/status')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update dispute status' })
  @ApiParam({ name: 'id', description: 'Dispute ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dispute status updated',
    type: DisputeResponseDto,
  })
  async updateDisputeStatus(
    @Param('id') disputeId: string,
    @Body() dto: UpdateDisputeStatusDto,
    @Req() req: Request,
  ): Promise<DisputeResponseDto> {
    return this.disputeService.updateDisputeStatus(disputeId, dto, req.user!.id);
  }

  @Post(':id/appeal')
  @Roles(UserRole.ADMIN, UserRole.AUTHOR, UserRole.READER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'File an appeal on a resolved dispute (one per issue)' })
  @ApiParam({ name: 'id', description: 'Dispute ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Appeal filed successfully',
    type: DisputeResponseDto,
  })
  async fileAppeal(
    @Param('id') disputeId: string,
    @Body() dto: FileAppealDto,
    @Req() req: Request,
  ): Promise<DisputeResponseDto> {
    return this.disputeService.fileAppeal(disputeId, req.user!.id, dto.reason);
  }

  @Put(':id/appeal/resolve')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resolve an appeal (admin only)' })
  @ApiParam({ name: 'id', description: 'Dispute ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Appeal resolved',
    type: DisputeResponseDto,
  })
  async resolveAppeal(
    @Param('id') disputeId: string,
    @Body() dto: ResolveAppealDto,
    @Req() req: Request,
  ): Promise<DisputeResponseDto> {
    return this.disputeService.resolveAppeal(disputeId, req.user!.id, dto.approved, dto.resolution);
  }
}
