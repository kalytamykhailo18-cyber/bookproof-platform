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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import {
  CreateCouponDto,
  UpdateCouponDto,
  ValidateCouponDto,
  CouponResponseDto,
  CouponValidationResponseDto,
  CouponUsageStatsDto,
  ManualApplyCouponDto,
} from './dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { GetUser } from '@common/decorators/get-user.decorator';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  /**
   * Create a new coupon (Admin only)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new coupon (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Coupon created successfully',
    type: CouponResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid coupon data' })
  @ApiResponse({ status: 409, description: 'Coupon code already exists' })
  async create(
    @Body() createCouponDto: CreateCouponDto,
    @GetUser('id') adminId: string,
  ): Promise<CouponResponseDto> {
    return this.couponsService.create(createCouponDto, adminId);
  }

  /**
   * Get all coupons (Admin only)
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all coupons (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of coupons',
    type: [CouponResponseDto],
  })
  async findAll(
    @Query('isActive') isActive?: string,
    @Query('appliesTo') appliesTo?: string,
  ): Promise<CouponResponseDto[]> {
    const filters: any = {};

    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }

    if (appliesTo) {
      filters.appliesTo = appliesTo;
    }

    return this.couponsService.findAll(filters);
  }

  /**
   * Get a coupon by ID (Admin only)
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a coupon by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Coupon details',
    type: CouponResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  async findOne(@Param('id') id: string): Promise<CouponResponseDto> {
    return this.couponsService.findOne(id);
  }

  /**
   * Update a coupon (Admin only)
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a coupon (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Coupon updated successfully',
    type: CouponResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  @ApiResponse({ status: 400, description: 'Invalid update data' })
  async update(
    @Param('id') id: string,
    @Body() updateCouponDto: UpdateCouponDto,
  ): Promise<CouponResponseDto> {
    return this.couponsService.update(id, updateCouponDto);
  }

  /**
   * Delete a coupon (Admin only) - Soft delete
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a coupon (Admin only) - Deactivates the coupon' })
  @ApiResponse({ status: 204, description: 'Coupon deleted successfully' })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.couponsService.remove(id);
  }

  /**
   * Validate a coupon (Public - authenticated users)
   */
  @Post('validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate a coupon code' })
  @ApiResponse({
    status: 200,
    description: 'Coupon validation result',
    type: CouponValidationResponseDto,
  })
  async validate(
    @Body() validateCouponDto: ValidateCouponDto,
    @GetUser('id') userId: string,
  ): Promise<CouponValidationResponseDto> {
    return this.couponsService.validateCoupon(validateCouponDto, userId);
  }

  /**
   * Get coupon usage statistics (Admin only)
   */
  @Get(':id/usage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get coupon usage statistics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Coupon usage statistics',
    type: CouponUsageStatsDto,
  })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  async getUsageStats(@Param('id') id: string): Promise<CouponUsageStatsDto> {
    return this.couponsService.getUsageStats(id);
  }

  /**
   * Manually apply a coupon to an order (Admin only)
   */
  @Post('manual-apply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Manually apply a coupon to an order (Admin only)',
    description:
      'Used when a customer forgot to apply a coupon or for customer service adjustments',
  })
  @ApiResponse({
    status: 200,
    description: 'Coupon applied successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid coupon or order' })
  @ApiResponse({ status: 404, description: 'Coupon, user, or order not found' })
  async manualApply(
    @Body() manualApplyDto: ManualApplyCouponDto,
    @GetUser('id') adminId: string,
  ): Promise<{ message: string }> {
    await this.couponsService.manualApply(manualApplyDto, adminId);
    return { message: 'Coupon applied successfully' };
  }
}
