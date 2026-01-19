import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  UpdateSettingDto,
  UpdateKeywordPricingDto,
  SettingResponseDto,
  KeywordPricingResponseDto,
  PricingSettingsResponseDto,
} from './dto';

// Setting keys as constants to prevent typos
export const SETTING_KEYS = {
  KEYWORD_RESEARCH_PRICE: 'keyword_research_price',
  KEYWORD_RESEARCH_CURRENCY: 'keyword_research_currency',
  KEYWORD_RESEARCH_ENABLED: 'keyword_research_enabled',
} as const;

// Default values for settings
const DEFAULT_SETTINGS: Record<
  string,
  { value: string; dataType: string; category: string; description: string; isPublic: boolean }
> = {
  [SETTING_KEYS.KEYWORD_RESEARCH_PRICE]: {
    value: '49.99',
    dataType: 'number',
    category: 'pricing',
    description: 'Price for keyword research service in USD',
    isPublic: true,
  },
  [SETTING_KEYS.KEYWORD_RESEARCH_CURRENCY]: {
    value: 'USD',
    dataType: 'string',
    category: 'pricing',
    description: 'Currency for keyword research pricing',
    isPublic: true,
  },
  [SETTING_KEYS.KEYWORD_RESEARCH_ENABLED]: {
    value: 'true',
    dataType: 'boolean',
    category: 'features',
    description: 'Enable or disable keyword research feature globally',
    isPublic: true,
  },
};

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  /**
   * Get a setting by key, creating it with default value if it doesn't exist
   */
  async getSetting(key: string): Promise<SettingResponseDto | null> {
    let setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });

    // If not found, create with default value if available
    if (!setting && DEFAULT_SETTINGS[key]) {
      const defaultValue = DEFAULT_SETTINGS[key];
      setting = await this.prisma.systemSetting.create({
        data: {
          key,
          value: defaultValue.value,
          dataType: defaultValue.dataType,
          category: defaultValue.category,
          description: defaultValue.description,
          isPublic: defaultValue.isPublic,
          isEditable: true,
        },
      });
    }

    if (!setting) {
      return null;
    }

    return this.toResponseDto(setting);
  }

  /**
   * Get all settings by category
   */
  async getSettingsByCategory(category: string): Promise<SettingResponseDto[]> {
    const settings = await this.prisma.systemSetting.findMany({
      where: { category },
      orderBy: { key: 'asc' },
    });

    return settings.map((s) => this.toResponseDto(s));
  }

  /**
   * Get all settings (admin only)
   */
  async getAllSettings(): Promise<SettingResponseDto[]> {
    const settings = await this.prisma.systemSetting.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });

    return settings.map((s) => this.toResponseDto(s));
  }

  /**
   * Update a setting
   */
  async updateSetting(
    key: string,
    dto: UpdateSettingDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<SettingResponseDto> {
    // Get or create the setting
    let setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!setting) {
      // Create with provided value if default exists
      if (DEFAULT_SETTINGS[key]) {
        setting = await this.prisma.systemSetting.create({
          data: {
            key,
            value: dto.value,
            dataType: DEFAULT_SETTINGS[key].dataType,
            category: DEFAULT_SETTINGS[key].category,
            description: DEFAULT_SETTINGS[key].description,
            isPublic: DEFAULT_SETTINGS[key].isPublic,
            isEditable: true,
            updatedBy: adminUserId,
          },
        });
      } else {
        throw new NotFoundException('Setting not found');
      }
    }

    if (!setting.isEditable) {
      throw new NotFoundException('This setting cannot be modified');
    }

    const oldValue = setting.value;

    // Update setting
    const updated = await this.prisma.systemSetting.update({
      where: { key },
      data: {
        value: dto.value,
        updatedBy: adminUserId,
      },
    });

    // Log audit trail
    await this.auditService.logSettingChange(
      key,
      oldValue,
      dto.value,
      dto.reason,
      adminUserId,
      adminEmail,
      ipAddress,
    );

    this.logger.log(`Setting '${key}' updated from '${oldValue}' to '${dto.value}' by ${adminEmail}`);

    return this.toResponseDto(updated);
  }

  /**
   * Get keyword research pricing
   */
  async getKeywordResearchPricing(): Promise<KeywordPricingResponseDto> {
    const priceSetting = await this.getSetting(SETTING_KEYS.KEYWORD_RESEARCH_PRICE);
    const currencySetting = await this.getSetting(SETTING_KEYS.KEYWORD_RESEARCH_CURRENCY);

    return {
      price: priceSetting ? parseFloat(priceSetting.value) : 49.99,
      currency: currencySetting?.value || 'USD',
      updatedAt: priceSetting?.updatedAt || new Date(),
      updatedBy: priceSetting?.updatedBy,
    };
  }

  /**
   * Update keyword research pricing
   */
  async updateKeywordResearchPricing(
    dto: UpdateKeywordPricingDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<KeywordPricingResponseDto> {
    await this.updateSetting(
      SETTING_KEYS.KEYWORD_RESEARCH_PRICE,
      { value: dto.price.toFixed(2), reason: dto.reason },
      adminUserId,
      adminEmail,
      ipAddress,
    );

    return this.getKeywordResearchPricing();
  }

  /**
   * Get all pricing settings
   */
  async getPricingSettings(): Promise<PricingSettingsResponseDto> {
    const keywordResearch = await this.getKeywordResearchPricing();

    return {
      keywordResearch,
    };
  }

  /**
   * Initialize default settings (run once during app startup or migration)
   */
  async initializeDefaults(): Promise<void> {
    for (const [key, defaultValue] of Object.entries(DEFAULT_SETTINGS)) {
      const existing = await this.prisma.systemSetting.findUnique({
        where: { key },
      });

      if (!existing) {
        await this.prisma.systemSetting.create({
          data: {
            key,
            value: defaultValue.value,
            dataType: defaultValue.dataType,
            category: defaultValue.category,
            description: defaultValue.description,
            isPublic: defaultValue.isPublic,
            isEditable: true,
          },
        });
        this.logger.log(`Initialized default setting: ${key} = ${defaultValue.value}`);
      }
    }
  }

  /**
   * Get the numeric value of keyword research price for use in services
   */
  async getKeywordResearchPrice(): Promise<number> {
    const pricing = await this.getKeywordResearchPricing();
    return pricing.price;
  }

  /**
   * Check if keyword research feature is enabled
   */
  async isKeywordResearchEnabled(): Promise<boolean> {
    const setting = await this.getSetting(SETTING_KEYS.KEYWORD_RESEARCH_ENABLED);
    return setting?.value === 'true';
  }

  /**
   * Set keyword research feature enabled/disabled state
   */
  async setKeywordResearchEnabled(
    enabled: boolean,
    adminUserId: string,
    adminEmail: string,
    reason?: string,
    ipAddress?: string,
  ): Promise<boolean> {
    await this.updateSetting(
      SETTING_KEYS.KEYWORD_RESEARCH_ENABLED,
      { value: enabled ? 'true' : 'false', reason },
      adminUserId,
      adminEmail,
      ipAddress,
    );

    this.logger.log(
      `Keyword research feature ${enabled ? 'enabled' : 'disabled'} by ${adminEmail}`,
    );

    return enabled;
  }

  private toResponseDto(setting: any): SettingResponseDto {
    return {
      id: setting.id,
      category: setting.category,
      key: setting.key,
      value: setting.value,
      dataType: setting.dataType,
      description: setting.description || undefined,
      isPublic: setting.isPublic,
      isEditable: setting.isEditable,
      updatedBy: setting.updatedBy || undefined,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt,
    };
  }
}
