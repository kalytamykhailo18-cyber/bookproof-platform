import { Controller, Post, Get, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ExceptionHandlingService } from '../services/exception-handling.service';
import {
  ExtendDeadlineDto,
  ShortenDeadlineDto,
  ReassignReaderDto,
  BulkReassignDto,
  CancelAssignmentDto,
  CorrectAssignmentErrorDto,
  BulkReassignResultDto,
  AssignmentExceptionDto,
} from '../dto/exception-handling.dto';

@ApiTags('Admin - Exception Handling')
@ApiBearerAuth()
@Controller('admin/assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ExceptionHandlingController {
  constructor(private exceptionHandlingService: ExceptionHandlingService) {}

  @Post(':id/extend-deadline')
  @ApiOperation({ summary: 'Extend assignment deadline' })
  @ApiResponse({ status: 200, description: 'Deadline extended successfully' })
  async extendDeadline(
    @Param('id') assignmentId: string,
    @Body() dto: ExtendDeadlineDto,
    @Req() req: Request,
  ) {
    return this.exceptionHandlingService.extendDeadline(
      assignmentId,
      dto,
      req.user!.id,
      req.user!.email,
      req.ip,
    );
  }

  @Post(':id/shorten-deadline')
  @ApiOperation({ summary: 'Shorten assignment deadline' })
  @ApiResponse({ status: 200, description: 'Deadline shortened successfully' })
  async shortenDeadline(
    @Param('id') assignmentId: string,
    @Body() dto: ShortenDeadlineDto,
    @Req() req: Request,
  ) {
    return this.exceptionHandlingService.shortenDeadline(
      assignmentId,
      dto,
      req.user!.id,
      req.user!.email,
      req.ip,
    );
  }

  @Post(':id/reassign')
  @ApiOperation({ summary: 'Reassign reader to different book' })
  @ApiResponse({ status: 200, description: 'Reader reassigned successfully' })
  async reassignReader(
    @Param('id') assignmentId: string,
    @Body() dto: ReassignReaderDto,
    @Req() req: Request,
  ) {
    return this.exceptionHandlingService.reassignReader(
      assignmentId,
      dto,
      req.user!.id,
      req.user!.email,
      req.ip,
    );
  }

  @Post('bulk-reassign')
  @ApiOperation({ summary: 'Bulk reassign multiple assignments' })
  @ApiResponse({ status: 200, description: 'Bulk reassignment completed', type: BulkReassignResultDto })
  async bulkReassign(
    @Body() dto: BulkReassignDto,
    @Req() req: Request,
  ): Promise<BulkReassignResultDto> {
    return this.exceptionHandlingService.bulkReassign(
      dto,
      req.user!.id,
      req.user!.email,
      req.ip,
    );
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel assignment' })
  @ApiResponse({ status: 200, description: 'Assignment cancelled successfully' })
  async cancelAssignment(
    @Param('id') assignmentId: string,
    @Body() dto: CancelAssignmentDto,
    @Req() req: Request,
  ) {
    return this.exceptionHandlingService.cancelAssignment(
      assignmentId,
      dto,
      req.user!.id,
      req.user!.email,
      req.ip,
    );
  }

  @Post(':id/correct-error')
  @ApiOperation({ summary: 'Correct assignment error' })
  @ApiResponse({ status: 200, description: 'Error corrected successfully' })
  async correctError(
    @Param('id') assignmentId: string,
    @Body() dto: CorrectAssignmentErrorDto,
    @Req() req: Request,
  ) {
    return this.exceptionHandlingService.correctAssignmentError(
      assignmentId,
      dto,
      req.user!.id,
      req.user!.email,
      req.ip,
    );
  }

  @Get('exceptions')
  @ApiOperation({ summary: 'Get assignment exceptions' })
  @ApiResponse({ status: 200, description: 'Exceptions list retrieved' })
  @ApiQuery({ name: 'bookId', required: false, description: 'Filter by book ID' })
  @ApiQuery({ name: 'readerProfileId', required: false, description: 'Filter by reader profile ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit results', type: Number })
  async getExceptions(
    @Query('bookId') bookId?: string,
    @Query('readerProfileId') readerProfileId?: string,
    @Query('limit') limitStr?: string,
  ): Promise<AssignmentExceptionDto[]> {
    // Parse limit safely to avoid NaN being passed to Prisma
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;
    const safeLimit = Number.isNaN(limit) ? undefined : limit;
    return this.exceptionHandlingService.getAssignmentExceptions(bookId, readerProfileId, safeLimit);
  }
}
