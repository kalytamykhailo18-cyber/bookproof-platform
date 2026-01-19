import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReadersService } from './readers.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateReaderProfileDto } from './dto/create-reader-profile.dto';
import { UpdateReaderProfileDto } from './dto/update-reader-profile.dto';
import { ReaderProfileResponseDto, AmazonProfileDto } from './dto/reader-profile-response.dto';
import { ReaderStatsResponseDto } from './dto/reader-stats-response.dto';

@ApiTags('readers')
@Controller('readers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReadersController {
  constructor(private readonly readersService: ReadersService) {}

  @Post('profile')
  @Roles(UserRole.READER)
  @ApiOperation({ summary: 'Create or update reader profile' })
  @ApiResponse({
    status: 201,
    description: 'Reader profile created or updated successfully',
    type: ReaderProfileResponseDto,
  })
  async createOrUpdateProfile(
    @Req() req: Request,
    @Body() createReaderProfileDto: CreateReaderProfileDto,
  ): Promise<ReaderProfileResponseDto> {
    return this.readersService.createOrUpdateProfile(req.user!.userId!, createReaderProfileDto);
  }

  @Get('profile')
  @Roles(UserRole.READER)
  @ApiOperation({ summary: 'Get current reader profile' })
  @ApiResponse({
    status: 200,
    description: 'Reader profile retrieved successfully',
    type: ReaderProfileResponseDto,
  })
  async getProfile(@Req() req: Request): Promise<ReaderProfileResponseDto> {
    return this.readersService.getProfile(req.user!.userId!);
  }

  @Put('profile')
  @Roles(UserRole.READER)
  @ApiOperation({ summary: 'Update reader profile' })
  @ApiResponse({
    status: 200,
    description: 'Reader profile updated successfully',
    type: ReaderProfileResponseDto,
  })
  async updateProfile(
    @Req() req: Request,
    @Body() updateReaderProfileDto: UpdateReaderProfileDto,
  ): Promise<ReaderProfileResponseDto> {
    return this.readersService.updateProfile(req.user!.userId!, updateReaderProfileDto);
  }

  @Get('stats')
  @Roles(UserRole.READER)
  @ApiOperation({ summary: 'Get reader statistics and performance metrics' })
  @ApiResponse({
    status: 200,
    description: 'Reader stats retrieved successfully',
    type: ReaderStatsResponseDto,
  })
  async getStats(@Req() req: Request): Promise<ReaderStatsResponseDto> {
    return this.readersService.getReaderStats(req.user!.userId!);
  }

  @Post('amazon-profiles')
  @Roles(UserRole.READER)
  @ApiOperation({ summary: 'Add Amazon profile (max 3)' })
  @ApiResponse({
    status: 201,
    description: 'Amazon profile added successfully',
    type: AmazonProfileDto,
  })
  async addAmazonProfile(
    @Req() req: Request,
    @Body() body: { profileUrl: string },
  ): Promise<AmazonProfileDto> {
    return this.readersService.addAmazonProfile(req.user!.userId!, body.profileUrl);
  }

  @Delete('amazon-profiles/:profileId')
  @Roles(UserRole.READER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove Amazon profile' })
  @ApiResponse({
    status: 204,
    description: 'Amazon profile removed successfully',
  })
  async removeAmazonProfile(@Req() req: Request, @Param('profileId') profileId: string): Promise<void> {
    return this.readersService.removeAmazonProfile(req.user!.userId!, profileId);
  }
}
