import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  UpdateSettingDto,
  UpdateKeywordPricingDto,
  SettingResponseDto,
  KeywordPricingResponseDto,
  PricingSettingsResponseDto,
  ReviewPaymentRatesDto,
  UpdateReviewPaymentRatesDto,
} from './dto';

// Setting keys as constants to prevent typos
export const SETTING_KEYS = {
  KEYWORD_RESEARCH_PRICE: 'keyword_research_price',
  KEYWORD_RESEARCH_CURRENCY: 'keyword_research_currency',
  KEYWORD_RESEARCH_ENABLED: 'keyword_research_enabled',
  EBOOK_REVIEW_PAYMENT_RATE: 'ebook_review_payment_rate',
  AUDIOBOOK_REVIEW_PAYMENT_RATE: 'audiobook_review_payment_rate',
  PAYMENT_CURRENCY: 'payment_currency',
  // System configuration settings (Section 5.6)
  DISTRIBUTION_DAY: 'distribution_day', // Day of weekly distribution (1-7, Monday=1)
  DISTRIBUTION_HOUR: 'distribution_hour', // Hour of distribution (0-23 UTC)
  OVERBOOKING_PERCENTAGE: 'overbooking_percentage', // Default 20%
  REVIEW_DEADLINE_HOURS: 'review_deadline_hours', // Default 72 hours
  MIN_REVIEW_WORD_COUNT: 'min_review_word_count', // Default 50 words
  MIN_PAYOUT_THRESHOLD: 'min_payout_threshold', // Minimum amount for payout requests
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
  [SETTING_KEYS.EBOOK_REVIEW_PAYMENT_RATE]: {
    value: '1.00',
    dataType: 'number',
    category: 'pricing',
    description: 'Payment rate for ebook reviews in USD (per requirements.md Section 3.8)',
    isPublic: true,
  },
  [SETTING_KEYS.AUDIOBOOK_REVIEW_PAYMENT_RATE]: {
    value: '2.00',
    dataType: 'number',
    category: 'pricing',
    description: 'Payment rate for audiobook reviews in USD (per requirements.md Section 3.8)',
    isPublic: true,
  },
  [SETTING_KEYS.PAYMENT_CURRENCY]: {
    value: 'USD',
    dataType: 'string',
    category: 'pricing',
    description: 'Currency for reader payment rates',
    isPublic: true,
  },
  // System configuration settings (Section 5.6)
  [SETTING_KEYS.DISTRIBUTION_DAY]: {
    value: '1', // Monday
    dataType: 'number',
    category: 'distribution',
    description: 'Day of weekly distribution (1=Monday, 7=Sunday)',
    isPublic: false,
  },
  [SETTING_KEYS.DISTRIBUTION_HOUR]: {
    value: '0', // Midnight UTC
    dataType: 'number',
    category: 'distribution',
    description: 'Hour of distribution in UTC (0-23)',
    isPublic: false,
  },
  [SETTING_KEYS.OVERBOOKING_PERCENTAGE]: {
    value: '20',
    dataType: 'number',
    category: 'distribution',
    description: 'Overbooking percentage for reader slots (default 20%)',
    isPublic: false,
  },
  [SETTING_KEYS.REVIEW_DEADLINE_HOURS]: {
    value: '72',
    dataType: 'number',
    category: 'reviews',
    description: 'Review submission deadline in hours from material access',
    isPublic: true,
  },
  [SETTING_KEYS.MIN_REVIEW_WORD_COUNT]: {
    value: '50',
    dataType: 'number',
    category: 'reviews',
    description: 'Minimum word count for review feedback',
    isPublic: true,
  },
  [SETTING_KEYS.MIN_PAYOUT_THRESHOLD]: {
    value: '10',
    dataType: 'number',
    category: 'payments',
    description: 'Minimum wallet balance required to request payout (USD)',
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
    const reviewPaymentRates = await this.getReviewPaymentRates();

    return {
      keywordResearch,
      reviewPaymentRates,
    };
  }

  /**
   * Get review payment rates
   */
  async getReviewPaymentRates(): Promise<ReviewPaymentRatesDto> {
    const ebookRateSetting = await this.getSetting(SETTING_KEYS.EBOOK_REVIEW_PAYMENT_RATE);
    const audiobookRateSetting = await this.getSetting(SETTING_KEYS.AUDIOBOOK_REVIEW_PAYMENT_RATE);
    const currencySetting = await this.getSetting(SETTING_KEYS.PAYMENT_CURRENCY);

    return {
      ebookRate: ebookRateSetting ? parseFloat(ebookRateSetting.value) : 1.0,
      audiobookRate: audiobookRateSetting ? parseFloat(audiobookRateSetting.value) : 2.0,
      currency: currencySetting?.value || 'USD',
      updatedAt: ebookRateSetting?.updatedAt || new Date(),
      updatedBy: ebookRateSetting?.updatedBy,
    };
  }

  /**
   * Get ebook review payment rate for use in services
   */
  async getEbookReviewRate(): Promise<number> {
    const setting = await this.getSetting(SETTING_KEYS.EBOOK_REVIEW_PAYMENT_RATE);
    return setting ? parseFloat(setting.value) : 1.0;
  }

  /**
   * Get audiobook review payment rate for use in services
   */
  async getAudiobookReviewRate(): Promise<number> {
    const setting = await this.getSetting(SETTING_KEYS.AUDIOBOOK_REVIEW_PAYMENT_RATE);
    return setting ? parseFloat(setting.value) : 2.0;
  }

  /**
   * Update review payment rates
   */
  async updateReviewPaymentRates(
    dto: UpdateReviewPaymentRatesDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<ReviewPaymentRatesDto> {
    if (dto.ebookRate !== undefined) {
      await this.updateSetting(
        SETTING_KEYS.EBOOK_REVIEW_PAYMENT_RATE,
        { value: dto.ebookRate.toFixed(2), reason: dto.reason },
        adminUserId,
        adminEmail,
        ipAddress,
      );
    }

    if (dto.audiobookRate !== undefined) {
      await this.updateSetting(
        SETTING_KEYS.AUDIOBOOK_REVIEW_PAYMENT_RATE,
        { value: dto.audiobookRate.toFixed(2), reason: dto.reason },
        adminUserId,
        adminEmail,
        ipAddress,
      );
    }

    return this.getReviewPaymentRates();
  }

  // ============================================
  // System Configuration Settings (Section 5.6)
  // ============================================

  /**
   * Get overbooking percentage for reader slots
   */
  async getOverbookingPercentage(): Promise<number> {
    const setting = await this.getSetting(SETTING_KEYS.OVERBOOKING_PERCENTAGE);
    return setting ? parseInt(setting.value, 10) : 20;
  }

  /**
   * Get review deadline duration in hours
   */
  async getReviewDeadlineHours(): Promise<number> {
    const setting = await this.getSetting(SETTING_KEYS.REVIEW_DEADLINE_HOURS);
    return setting ? parseInt(setting.value, 10) : 72;
  }

  /**
   * Get minimum review word count
   */
  async getMinReviewWordCount(): Promise<number> {
    const setting = await this.getSetting(SETTING_KEYS.MIN_REVIEW_WORD_COUNT);
    return setting ? parseInt(setting.value, 10) : 50;
  }

  /**
   * Get distribution schedule (day and hour)
   */
  async getDistributionSchedule(): Promise<{ day: number; hour: number }> {
    const daySetting = await this.getSetting(SETTING_KEYS.DISTRIBUTION_DAY);
    const hourSetting = await this.getSetting(SETTING_KEYS.DISTRIBUTION_HOUR);
    return {
      day: daySetting ? parseInt(daySetting.value, 10) : 1, // Monday
      hour: hourSetting ? parseInt(hourSetting.value, 10) : 0, // Midnight UTC
    };
  }

  /**
   * Get minimum payout threshold
   */
  async getMinPayoutThreshold(): Promise<number> {
    const setting = await this.getSetting(SETTING_KEYS.MIN_PAYOUT_THRESHOLD);
    return setting ? parseFloat(setting.value) : 10;
  }

  /**
   * Get all system configuration settings
   */
  async getSystemConfiguration(): Promise<{
    distributionDay: number;
    distributionHour: number;
    overbookingPercentage: number;
    reviewDeadlineHours: number;
    minReviewWordCount: number;
    minPayoutThreshold: number;
    updatedAt?: Date;
  }> {
    const [daySetting, hourSetting, overbookingSetting, deadlineSetting, wordCountSetting, payoutSetting] = await Promise.all([
      this.getSetting(SETTING_KEYS.DISTRIBUTION_DAY),
      this.getSetting(SETTING_KEYS.DISTRIBUTION_HOUR),
      this.getSetting(SETTING_KEYS.OVERBOOKING_PERCENTAGE),
      this.getSetting(SETTING_KEYS.REVIEW_DEADLINE_HOURS),
      this.getSetting(SETTING_KEYS.MIN_REVIEW_WORD_COUNT),
      this.getSetting(SETTING_KEYS.MIN_PAYOUT_THRESHOLD),
    ]);

    return {
      distributionDay: daySetting ? parseInt(daySetting.value, 10) : 1,
      distributionHour: hourSetting ? parseInt(hourSetting.value, 10) : 0,
      overbookingPercentage: overbookingSetting ? parseInt(overbookingSetting.value, 10) : 20,
      reviewDeadlineHours: deadlineSetting ? parseInt(deadlineSetting.value, 10) : 72,
      minReviewWordCount: wordCountSetting ? parseInt(wordCountSetting.value, 10) : 50,
      minPayoutThreshold: payoutSetting ? parseFloat(payoutSetting.value) : 10,
      updatedAt: overbookingSetting?.updatedAt,
    };
  }

  /**
   * Update system configuration settings (Section 5.6)
   */
  async updateSystemConfiguration(
    dto: {
      distributionDay?: number;
      distributionHour?: number;
      overbookingPercentage?: number;
      reviewDeadlineHours?: number;
      minReviewWordCount?: number;
      minPayoutThreshold?: number;
      reason?: string;
    },
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<{
    distributionDay: number;
    distributionHour: number;
    overbookingPercentage: number;
    reviewDeadlineHours: number;
    minReviewWordCount: number;
    minPayoutThreshold: number;
    updatedAt?: Date;
  }> {
    // Update only provided values
    if (dto.distributionDay !== undefined) {
      await this.updateSetting(
        SETTING_KEYS.DISTRIBUTION_DAY,
        { value: dto.distributionDay.toString(), reason: dto.reason },
        adminUserId,
        adminEmail,
        ipAddress,
      );
    }

    if (dto.distributionHour !== undefined) {
      await this.updateSetting(
        SETTING_KEYS.DISTRIBUTION_HOUR,
        { value: dto.distributionHour.toString(), reason: dto.reason },
        adminUserId,
        adminEmail,
        ipAddress,
      );
    }

    if (dto.overbookingPercentage !== undefined) {
      await this.updateSetting(
        SETTING_KEYS.OVERBOOKING_PERCENTAGE,
        { value: dto.overbookingPercentage.toString(), reason: dto.reason },
        adminUserId,
        adminEmail,
        ipAddress,
      );
    }

    if (dto.reviewDeadlineHours !== undefined) {
      await this.updateSetting(
        SETTING_KEYS.REVIEW_DEADLINE_HOURS,
        { value: dto.reviewDeadlineHours.toString(), reason: dto.reason },
        adminUserId,
        adminEmail,
        ipAddress,
      );
    }

    if (dto.minReviewWordCount !== undefined) {
      await this.updateSetting(
        SETTING_KEYS.MIN_REVIEW_WORD_COUNT,
        { value: dto.minReviewWordCount.toString(), reason: dto.reason },
        adminUserId,
        adminEmail,
        ipAddress,
      );
    }

    if (dto.minPayoutThreshold !== undefined) {
      await this.updateSetting(
        SETTING_KEYS.MIN_PAYOUT_THRESHOLD,
        { value: dto.minPayoutThreshold.toString(), reason: dto.reason },
        adminUserId,
        adminEmail,
        ipAddress,
      );
    }

    this.logger.log(`System configuration updated by ${adminEmail}`);
    return this.getSystemConfiguration();
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
