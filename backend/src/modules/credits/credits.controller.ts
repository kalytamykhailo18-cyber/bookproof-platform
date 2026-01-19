import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreditsService } from './credits.service';
import {
  PackageTierResponseDto,
  CreditPurchaseResponseDto,
  CreditBalanceResponseDto,
  CheckoutSessionResponseDto,
  PurchaseCreditDto,
} from './dto';

@ApiTags('Credits')
@Controller('credits')
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get('packages')
  @ApiOperation({ summary: 'Get all active package tiers' })
  @ApiResponse({
    status: 200,
    description: 'Package tiers retrieved successfully',
    type: [PackageTierResponseDto],
  })
  async getPackageTiers(): Promise<PackageTierResponseDto[]> {
    return this.creditsService.getPackageTiers();
  }

  @Get('balance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AUTHOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get credit balance for authenticated author' })
  @ApiResponse({
    status: 200,
    description: 'Credit balance retrieved successfully',
    type: CreditBalanceResponseDto,
  })
  async getCreditBalance(@Req() req: Request): Promise<CreditBalanceResponseDto> {
    return this.creditsService.getCreditBalance(req.user!.authorProfileId!);
  }

  @Get('purchases')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AUTHOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get purchase history for authenticated author' })
  @ApiResponse({
    status: 200,
    description: 'Purchase history retrieved successfully',
    type: [CreditPurchaseResponseDto],
  })
  async getPurchaseHistory(@Req() req: Request): Promise<CreditPurchaseResponseDto[]> {
    return this.creditsService.getPurchaseHistory(req.user!.authorProfileId!);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AUTHOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create Stripe checkout session for credit purchase' })
  @ApiResponse({
    status: 200,
    description: 'Checkout session created successfully',
    type: CheckoutSessionResponseDto,
  })
  async createCheckoutSession(
    @Req() req: Request,
    @Body() dto: PurchaseCreditDto,
  ): Promise<CheckoutSessionResponseDto> {
    return this.creditsService.createCheckoutSession(req.user!.authorProfileId!, dto);
  }
}
