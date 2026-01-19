import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CampaignsService } from './campaigns.service';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  CampaignResponseDto,
  ActivateCampaignDto,
} from './dto';

@ApiTags('Campaigns')
@Controller('campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.AUTHOR)
@ApiBearerAuth()
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new campaign in DRAFT status' })
  @ApiResponse({
    status: 201,
    description: 'Campaign created successfully',
    type: CampaignResponseDto,
  })
  async createCampaign(
    @Req() req: Request,
    @Body() dto: CreateCampaignDto,
  ): Promise<CampaignResponseDto> {
    return this.campaignsService.createCampaign(req.user!.authorProfileId!, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all campaigns for authenticated author' })
  @ApiResponse({
    status: 200,
    description: 'Campaigns retrieved successfully',
    type: [CampaignResponseDto],
  })
  async getCampaigns(@Req() req: Request): Promise<CampaignResponseDto[]> {
    return this.campaignsService.getCampaigns(req.user!.authorProfileId!);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign by ID' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({
    status: 200,
    description: 'Campaign retrieved successfully',
    type: CampaignResponseDto,
  })
  async getCampaign(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<CampaignResponseDto> {
    return this.campaignsService.getCampaign(id, req.user!.authorProfileId!);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update campaign (DRAFT only)' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({
    status: 200,
    description: 'Campaign updated successfully',
    type: CampaignResponseDto,
  })
  async updateCampaign(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
  ): Promise<CampaignResponseDto> {
    return this.campaignsService.updateCampaign(
      id,
      req.user!.authorProfileId!,
      dto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete campaign (DRAFT only)' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: 204,
    description: 'Campaign deleted successfully',
  })
  async deleteCampaign(@Req() req: Request, @Param('id') id: string): Promise<void> {
    return this.campaignsService.deleteCampaign(id, req.user!.authorProfileId!);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate campaign and allocate credits' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({
    status: 200,
    description: 'Campaign activated successfully',
    type: CampaignResponseDto,
  })
  async activateCampaign(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: ActivateCampaignDto,
  ): Promise<CampaignResponseDto> {
    return this.campaignsService.activateCampaign(
      id,
      req.user!.authorProfileId!,
      dto,
    );
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause an active campaign' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({
    status: 200,
    description: 'Campaign paused successfully',
    type: CampaignResponseDto,
  })
  async pauseCampaign(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<CampaignResponseDto> {
    return this.campaignsService.pauseCampaign(id, req.user!.authorProfileId!);
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Resume a paused campaign' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({
    status: 200,
    description: 'Campaign resumed successfully',
    type: CampaignResponseDto,
  })
  async resumeCampaign(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<CampaignResponseDto> {
    return this.campaignsService.resumeCampaign(id, req.user!.authorProfileId!);
  }
}
