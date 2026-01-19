import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { WalletPayoutService } from '../services/payout.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import {
  RequestPayoutDto,
  ApprovePayoutDto,
  RejectPayoutDto,
  CompletePayoutDto,
  PayoutResponseDto,
  WalletTransactionResponseDto,
  WalletSummaryResponseDto,
} from '../dto/payout.dto';

interface UserData {
  id: string;
  email: string;
  role: UserRole;
  profileId: string;
}

@Controller('payouts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayoutController {
  constructor(private readonly payoutService: WalletPayoutService) {}

  @Post('request')
  @Roles(UserRole.READER)
  async requestPayout(
    @CurrentUser() user: UserData,
    @Body() dto: RequestPayoutDto,
  ): Promise<PayoutResponseDto> {
    return this.payoutService.requestPayout(user.profileId, dto);
  }

  @Get('my-payouts')
  @Roles(UserRole.READER)
  async getMyPayouts(@CurrentUser() user: UserData): Promise<PayoutResponseDto[]> {
    return this.payoutService.getReaderPayouts(user.profileId);
  }

  @Get('transactions')
  @Roles(UserRole.READER)
  async getMyTransactions(
    @CurrentUser() user: UserData,
  ): Promise<WalletTransactionResponseDto[]> {
    return this.payoutService.getWalletTransactions(user.profileId);
  }

  @Get('wallet-summary')
  @Roles(UserRole.READER)
  async getWalletSummary(
    @CurrentUser() user: UserData,
  ): Promise<WalletSummaryResponseDto> {
    return this.payoutService.getWalletSummary(user.profileId);
  }

  @Get('pending')
  @Roles(UserRole.ADMIN)
  async getPendingPayouts(): Promise<PayoutResponseDto[]> {
    return this.payoutService.getPendingPayouts();
  }

  @Get('all')
  @Roles(UserRole.ADMIN)
  async getAllPayouts(): Promise<PayoutResponseDto[]> {
    return this.payoutService.getAllPayouts();
  }

  @Post(':id/approve')
  @Roles(UserRole.ADMIN)
  async approvePayout(
    @Param('id') id: string,
    @CurrentUser() user: UserData,
    @Body() dto: ApprovePayoutDto,
  ): Promise<PayoutResponseDto> {
    return this.payoutService.approvePayout(id, user.id, dto.notes);
  }

  @Post(':id/reject')
  @Roles(UserRole.ADMIN)
  async rejectPayout(
    @Param('id') id: string,
    @CurrentUser() user: UserData,
    @Body() dto: RejectPayoutDto,
  ): Promise<PayoutResponseDto> {
    return this.payoutService.rejectPayout(id, user.id, dto.reason);
  }

  @Post(':id/complete')
  @Roles(UserRole.ADMIN)
  async completePayout(
    @Param('id') id: string,
    @CurrentUser() user: UserData,
    @Body() dto: CompletePayoutDto,
  ): Promise<PayoutResponseDto> {
    return this.payoutService.completePayout(id, user.id, dto.transactionId, dto.notes);
  }
}
