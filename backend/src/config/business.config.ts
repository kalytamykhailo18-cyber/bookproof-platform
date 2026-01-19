import { registerAs } from '@nestjs/config';

export default registerAs('business', () => ({
  credits: {
    ebookValue: parseInt(process.env.EBOOK_CREDIT_VALUE || '1', 10),
    audiobookValue: parseInt(process.env.AUDIOBOOK_CREDIT_VALUE || '2', 10),
  },
  packages: {
    smallValidityDays: parseInt(process.env.SMALL_PACKAGE_VALIDITY_DAYS || '30', 10),
    mediumValidityDays: parseInt(process.env.MEDIUM_PACKAGE_VALIDITY_DAYS || '90', 10),
    largeValidityDays: parseInt(process.env.LARGE_PACKAGE_VALIDITY_DAYS || '120', 10),
  },
  queue: {
    overbookingPercentage: parseInt(process.env.OVERBOOKING_PERCENTAGE || '20', 10),
    assignmentDeadlineHours: parseInt(process.env.ASSIGNMENT_DEADLINE_HOURS || '72', 10),
    readerSelectionPoolSize: parseInt(process.env.READER_SELECTION_POOL_SIZE || '50', 10),
  },
  reminders: {
    hours24: parseInt(process.env.REMINDER_24H || '24', 10),
    hours48: parseInt(process.env.REMINDER_48H || '48', 10),
    hours72: parseInt(process.env.REMINDER_72H || '72', 10),
  },
  amazon: {
    guaranteeDays: parseInt(process.env.AMAZON_GUARANTEE_DAYS || '14', 10),
    checkIntervalHours: parseInt(process.env.AMAZON_CHECK_INTERVAL_HOURS || '24', 10),
  },
  affiliate: {
    commissionPercentage: parseInt(process.env.AFFILIATE_COMMISSION_PERCENTAGE || '20', 10),
    cookieDays: parseInt(process.env.AFFILIATE_COOKIE_DAYS || '30', 10),
  },
  wallet: {
    minimumPayoutAmount: parseFloat(process.env.MINIMUM_PAYOUT_AMOUNT || '25.00'),
  },
  features: {
    subscriptions: process.env.FEATURE_SUBSCRIPTIONS === 'true',
    keywordResearch: process.env.FEATURE_KEYWORD_RESEARCH !== 'false',
    affiliateProgram: process.env.FEATURE_AFFILIATE_PROGRAM !== 'false',
    audiobook: process.env.FEATURE_AUDIOBOOK !== 'false',
  },
}));
