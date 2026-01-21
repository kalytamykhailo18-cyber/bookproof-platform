import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import {
  CreateMarketingMaterialDto,
  UpdateMarketingMaterialDto,
  GetMarketingMaterialsQueryDto,
  MarketingMaterialResponseDto,
} from '../dto/marketing-material.dto';
import { MarketingMaterialType, Language } from '@prisma/client';

/**
 * Service for managing affiliate marketing materials
 */
@Injectable()
export class MarketingMaterialsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all marketing materials (public for affiliates)
   */
  async getMarketingMaterials(
    query: GetMarketingMaterialsQueryDto,
  ): Promise<MarketingMaterialResponseDto[]> {
    const where: any = {};

    // Filter by type
    if (query.type) {
      where.type = query.type;
    }

    // Filter by language
    if (query.language) {
      where.language = query.language;
    }

    // By default, only show active materials (unless admin explicitly requests inactive)
    if (!query.includeInactive) {
      where.isActive = true;
    }

    const materials = await this.prisma.affiliateMarketingMaterial.findMany({
      where,
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return materials as MarketingMaterialResponseDto[];
  }

  /**
   * Get a single marketing material by ID
   */
  async getMarketingMaterialById(id: string): Promise<MarketingMaterialResponseDto> {
    const material = await this.prisma.affiliateMarketingMaterial.findUnique({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException('Marketing material not found');
    }

    return material as MarketingMaterialResponseDto;
  }

  /**
   * Track download of a marketing material
   * Called when affiliate downloads/views a material
   */
  async trackDownload(id: string): Promise<void> {
    const material = await this.prisma.affiliateMarketingMaterial.findUnique({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException('Marketing material not found');
    }

    if (!material.isActive) {
      throw new BadRequestException('This material is no longer active');
    }

    // Increment download count
    await this.prisma.affiliateMarketingMaterial.update({
      where: { id },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Create a new marketing material (Admin only)
   */
  async createMarketingMaterial(
    dto: CreateMarketingMaterialDto,
    adminUserId: string,
  ): Promise<MarketingMaterialResponseDto> {
    // Validate that at least one of fileUrl or content is provided
    if (!dto.fileUrl && !dto.content) {
      throw new BadRequestException('Either fileUrl or content must be provided');
    }

    const material = await this.prisma.affiliateMarketingMaterial.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        fileUrl: dto.fileUrl,
        thumbnailUrl: dto.thumbnailUrl,
        content: dto.content,
        language: dto.language || Language.EN,
        displayOrder: dto.displayOrder || 0,
        isActive: true,
      },
    });

    // TODO: Add audit logging with proper user context from controller

    return material as MarketingMaterialResponseDto;
  }

  /**
   * Update a marketing material (Admin only)
   */
  async updateMarketingMaterial(
    id: string,
    dto: UpdateMarketingMaterialDto,
    adminUserId: string,
  ): Promise<MarketingMaterialResponseDto> {
    const existing = await this.prisma.affiliateMarketingMaterial.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Marketing material not found');
    }

    const updated = await this.prisma.affiliateMarketingMaterial.update({
      where: { id },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
    });

    // TODO: Add audit logging with proper user context from controller

    return updated as MarketingMaterialResponseDto;
  }

  /**
   * Delete a marketing material (Admin only)
   */
  async deleteMarketingMaterial(id: string, adminUserId: string): Promise<void> {
    const existing = await this.prisma.affiliateMarketingMaterial.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Marketing material not found');
    }

    await this.prisma.affiliateMarketingMaterial.delete({
      where: { id },
    });

    // TODO: Add audit logging with proper user context from controller
  }

  /**
   * Toggle active status (Admin only)
   */
  async toggleActive(id: string, adminUserId: string): Promise<MarketingMaterialResponseDto> {
    const existing = await this.prisma.affiliateMarketingMaterial.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Marketing material not found');
    }

    const updated = await this.prisma.affiliateMarketingMaterial.update({
      where: { id },
      data: {
        isActive: !existing.isActive,
      },
    });

    // TODO: Add audit logging with proper user context from controller

    return updated as MarketingMaterialResponseDto;
  }

  /**
   * Get marketing materials statistics (Admin only)
   */
  async getStatistics(): Promise<{
    totalMaterials: number;
    activeMaterials: number;
    totalDownloads: number;
    byType: Record<MarketingMaterialType, number>;
    byLanguage: Record<Language, number>;
  }> {
    const [total, active, materials] = await Promise.all([
      this.prisma.affiliateMarketingMaterial.count(),
      this.prisma.affiliateMarketingMaterial.count({ where: { isActive: true } }),
      this.prisma.affiliateMarketingMaterial.findMany(),
    ]);

    const totalDownloads = materials.reduce((sum, m) => sum + m.downloadCount, 0);

    const byType: Record<string, number> = {};
    const byLanguage: Record<string, number> = {};

    materials.forEach((material) => {
      byType[material.type] = (byType[material.type] || 0) + 1;
      byLanguage[material.language] = (byLanguage[material.language] || 0) + 1;
    });

    return {
      totalMaterials: total,
      activeMaterials: active,
      totalDownloads,
      byType: byType as Record<MarketingMaterialType, number>,
      byLanguage: byLanguage as Record<Language, number>,
    };
  }
}
