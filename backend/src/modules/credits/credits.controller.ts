import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Public } from '@common/decorators/public.decorator';
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
  @Public() // Package tiers should be publicly accessible for pricing display
  @ApiOperation({ summary: 'Get all active package tiers with optional currency-specific pricing' })
  @ApiQuery({
    name: 'currency',
    required: false,
    description: 'Currency code (USD, BRL, EUR). Returns prices in specified currency if available.',
    example: 'BRL',
  })
  @ApiResponse({
    status: 200,
    description: 'Package tiers retrieved successfully',
    type: [PackageTierResponseDto],
  })
  async getPackageTiers(@Query('currency') currency?: string): Promise<PackageTierResponseDto[]> {
    return this.creditsService.getPackageTiers(currency);
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
