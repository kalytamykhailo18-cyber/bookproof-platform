-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('AUTHOR', 'READER', 'ADMIN', 'CLOSER', 'AFFILIATE');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'PT', 'ES');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RefundReason" AS ENUM ('DIDNT_NEED_CREDITS', 'WRONG_PACKAGE', 'ACCIDENTAL_PURCHASE', 'SERVICE_NOT_AS_EXPECTED', 'OTHER');

-- CreateEnum
CREATE TYPE "RefundRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'INCOMPLETE', 'INCOMPLETE_EXPIRED', 'TRIALING', 'UNPAID');

-- CreateEnum
CREATE TYPE "CreditTransactionType" AS ENUM ('PURCHASE', 'SUBSCRIPTION_RENEWAL', 'ALLOCATION', 'DEDUCTION', 'REFUND', 'MANUAL_ADJUSTMENT', 'EXPIRATION', 'BONUS');

-- CreateEnum
CREATE TYPE "BookFormat" AS ENUM ('EBOOK', 'AUDIOBOOK', 'BOTH');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'PENDING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ContentPreference" AS ENUM ('EBOOK', 'AUDIOBOOK', 'BOTH');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('WAITING', 'SCHEDULED', 'APPROVED', 'IN_PROGRESS', 'SUBMITTED', 'VALIDATED', 'COMPLETED', 'EXPIRED', 'REASSIGNED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('MATERIALS_READY', 'DEADLINE_24H', 'DEADLINE_48H', 'DEADLINE_60H', 'DEADLINE_69H', 'DEADLINE_72H', 'EXPIRATION_NOTICE');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING_SUBMISSION', 'SUBMITTED', 'PENDING_VALIDATION', 'VALIDATED', 'REJECTED', 'FLAGGED', 'REMOVED_BY_AMAZON');

-- CreateEnum
CREATE TYPE "IssueType" AS ENUM ('INVALID_LINK', 'REVIEW_NOT_FOUND', 'WRONG_BOOK', 'DUPLICATE', 'REMOVED_BY_AMAZON', 'SUSPICIOUS_CONTENT', 'GUIDELINE_VIOLATION', 'PROFILE_MISMATCH', 'AUTHOR_DISPUTE', 'AUTHOR_COMPLAINT', 'READER_COMPLAINT', 'UNUSUAL_BEHAVIOR', 'SUSPECTED_FRAUD', 'PAYMENT_FAILED', 'PAYMENT_DISPUTE', 'REFUND_REQUEST', 'PAYOUT_ISSUE', 'DUPLICATE_PAYMENT', 'TECHNICAL_ERROR', 'SYSTEM_FAILURE', 'DATA_INCONSISTENCY', 'OTHER');

-- CreateEnum
CREATE TYPE "IssueSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IssueResolutionStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'ESCALATED', 'RESUBMISSION_PENDING');

-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('EARNING', 'PAYOUT', 'ADJUSTMENT', 'BONUS', 'REVERSAL');

-- CreateEnum
CREATE TYPE "PayoutRequestStatus" AS ENUM ('REQUESTED', 'PENDING_REVIEW', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT');

-- CreateEnum
CREATE TYPE "CustomPackageStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'SENT', 'VIEWED', 'PAID', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PackageApprovalStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MarketingMaterialType" AS ENUM ('BANNER_IMAGE', 'SOCIAL_POST', 'EMAIL_TEMPLATE', 'PROMOTIONAL_COPY', 'VIDEO', 'INFOGRAPHIC', 'LANDING_PAGE_TEMPLATE');

-- CreateEnum
CREATE TYPE "CouponType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_ADDON');

-- CreateEnum
CREATE TYPE "CouponAppliesTo" AS ENUM ('CREDITS', 'KEYWORD_RESEARCH', 'ALL');

-- CreateEnum
CREATE TYPE "KeywordResearchStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TargetMarket" AS ENUM ('US', 'BR');

-- CreateEnum
CREATE TYPE "LogSeverity" AS ENUM ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('WELCOME', 'EMAIL_VERIFICATION', 'PASSWORD_RESET', 'PASSWORD_CHANGED', 'READER_APPLICATION_RECEIVED', 'READER_MATERIALS_READY', 'READER_DEADLINE_24H', 'READER_DEADLINE_48H', 'READER_DEADLINE_72H', 'READER_ASSIGNMENT_EXPIRED', 'READER_REVIEW_SUBMITTED', 'READER_REVIEW_VALIDATED', 'READER_REVIEW_REJECTED', 'READER_PAYOUT_COMPLETED', 'READER_ASSIGNMENT_REASSIGNED', 'READER_ASSIGNMENT_CANCELLED', 'READER_DEADLINE_EXTENDED', 'READER_RESUBMISSION_REQUESTED', 'READER_REPLACEMENT_ASSIGNED', 'AUTHOR_CAMPAIGN_STARTED', 'AUTHOR_CAMPAIGN_COMPLETED', 'AUTHOR_REPORT_READY', 'AUTHOR_PAYMENT_RECEIVED', 'AUTHOR_PAYMENT_FAILED', 'AUTHOR_CREDITS_EXPIRING_SOON', 'AUTHOR_CREDITS_EXPIRED', 'AUTHOR_CREDITS_ADDED', 'AUTHOR_CREDITS_REMOVED', 'ADMIN_NEW_ISSUE', 'ADMIN_URGENT_ISSUE', 'ADMIN_PAYOUT_REQUESTED', 'ADMIN_NEW_AFFILIATE_APPLICATION', 'ADMIN_CRITICAL_ERROR', 'ADMIN_NOTIFICATION', 'PAYMENT_RECEIVED', 'PAYMENT_FAILED', 'REFUND_PROCESSED', 'SUBSCRIPTION_RENEWED', 'SUBSCRIPTION_CANCELLED', 'KEYWORD_RESEARCH_READY', 'AFFILIATE_APPLICATION_RECEIVED', 'AFFILIATE_APPLICATION_APPROVED', 'AFFILIATE_APPLICATION_REJECTED', 'AFFILIATE_PAYOUT_PROCESSED', 'AFFILIATE_NEW_REFERRAL', 'CLOSER_PAYMENT_RECEIVED', 'CLOSER_ACCOUNT_CREATED', 'CLOSER_PACKAGE_SENT_TO_CLIENT', 'AUTHOR_ACCOUNT_CREATED_BY_CLOSER', 'LANDING_PAGE_WELCOME');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'FAILED', 'SPAM_COMPLAINT');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'CAMPAIGN', 'REVIEW', 'PAYMENT', 'ADMIN', 'GENERAL');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "DisputeType" AS ENUM ('AUTHOR_DISPUTE', 'AUTHOR_COMPLAINT', 'READER_COMPLAINT', 'REVIEW_QUALITY', 'PAYMENT_ISSUE', 'SERVICE_ISSUE', 'POLICY_VIOLATION', 'OTHER');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DisputePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AppealStatus" AS ENUM ('NONE', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentIssueType" AS ENUM ('PAYMENT_FAILED', 'PAYMENT_DISPUTE', 'REFUND_REQUEST', 'PAYOUT_ISSUE', 'DUPLICATE_PAYMENT', 'CREDIT_MISMATCH', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentIssueStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "PaymentIssueAction" AS ENUM ('REFUNDED', 'CORRECTED', 'RECONCILED', 'CREDITED', 'NO_ACTION', 'REJECTED', 'ESCALATED', 'PENDING_STRIPE');

-- CreateEnum
CREATE TYPE "BehaviorFlagType" AS ENUM ('FAST_REVIEW', 'SIMILAR_TEXT', 'MULTIPLE_IP', 'DEVICE_FINGERPRINT', 'HIGH_REJECTION_RATE', 'NEW_ACCOUNT_ABUSE');

-- CreateEnum
CREATE TYPE "BehaviorFlagStatus" AS ENUM ('ACTIVE', 'DISMISSED', 'INVESTIGATED', 'CONFIRMED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "name" TEXT NOT NULL,
    "companyName" TEXT,
    "phone" TEXT,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "country" TEXT,
    "preferredLanguage" "Language" NOT NULL DEFAULT 'EN',
    "preferredCurrency" TEXT NOT NULL DEFAULT 'USD',
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "photo" TEXT,
    "bio" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "bannedAt" TIMESTAMP(3),
    "bannedBy" TEXT,
    "banReason" TEXT,
    "deletionScheduledAt" TIMESTAMP(3),
    "deletionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "notificationEmailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "notificationEmailFrequency" TEXT NOT NULL DEFAULT 'IMMEDIATE',
    "notificationDisabledTypes" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalCreditsPurchased" INTEGER NOT NULL DEFAULT 0,
    "totalCreditsUsed" INTEGER NOT NULL DEFAULT 0,
    "availableCredits" INTEGER NOT NULL DEFAULT 0,
    "pendingKeywordResearchCredits" INTEGER NOT NULL DEFAULT 0,
    "stripeCustomerId" TEXT,
    "referredByAffiliateId" TEXT,
    "referredByCloserId" TEXT,
    "referralDate" TIMESTAMP(3),
    "accountCreatedByCloser" BOOLEAN NOT NULL DEFAULT false,
    "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "termsAcceptedAt" TIMESTAMP(3),
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "suspendedAt" TIMESTAMP(3),
    "suspendedBy" TEXT,
    "suspendReason" TEXT,
    "adminNotes" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageTier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "validityDays" INTEGER NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "features" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditPurchase" (
    "id" TEXT NOT NULL,
    "authorProfileId" TEXT NOT NULL,
    "packageTierId" TEXT,
    "credits" INTEGER NOT NULL,
    "amountPaid" DECIMAL(10,2) NOT NULL,
    "baseAmount" DECIMAL(10,2),
    "discountAmount" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "validityDays" INTEGER NOT NULL,
    "activationWindowDays" INTEGER NOT NULL DEFAULT 30,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activationWindowExpiresAt" TIMESTAMP(3) NOT NULL,
    "activated" BOOLEAN NOT NULL DEFAULT false,
    "activatedAt" TIMESTAMP(3),
    "adminNotes" TEXT,
    "stripePaymentId" TEXT,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "couponId" TEXT,
    "discountApplied" DECIMAL(10,2),
    "refundedAt" TIMESTAMP(3),
    "refundAmount" DECIMAL(10,2),
    "refundReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundRequest" (
    "id" TEXT NOT NULL,
    "creditPurchaseId" TEXT NOT NULL,
    "authorProfileId" TEXT NOT NULL,
    "reason" "RefundReason" NOT NULL,
    "explanation" TEXT,
    "status" "RefundRequestStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "refundAmount" DECIMAL(10,2),
    "stripeRefundId" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefundRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "authorProfileId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "creditsPerMonth" INTEGER NOT NULL,
    "pricePerMonth" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "totalCreditsAllocated" INTEGER NOT NULL DEFAULT 0,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "authorProfileId" TEXT NOT NULL,
    "bookId" TEXT,
    "amount" INTEGER NOT NULL,
    "type" "CreditTransactionType" NOT NULL,
    "description" TEXT NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "performedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "authorProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "asin" TEXT NOT NULL,
    "isbn" TEXT,
    "amazonLink" TEXT NOT NULL,
    "synopsis" TEXT NOT NULL,
    "synopsisFileUrl" TEXT,
    "synopsisFileName" TEXT,
    "language" "Language" NOT NULL,
    "genre" TEXT NOT NULL,
    "secondaryGenre" TEXT,
    "category" TEXT NOT NULL,
    "publishedDate" TIMESTAMP(3),
    "pageCount" INTEGER,
    "wordCount" INTEGER,
    "seriesName" TEXT,
    "seriesNumber" INTEGER,
    "availableFormats" "BookFormat" NOT NULL,
    "ebookFileUrl" TEXT,
    "ebookFileName" TEXT,
    "ebookFileSize" BIGINT,
    "audioBookFileUrl" TEXT,
    "audioBookFileName" TEXT,
    "audioBookFileSize" BIGINT,
    "audioBookDuration" INTEGER,
    "coverImageUrl" TEXT,
    "readingInstructions" TEXT,
    "slug" TEXT,
    "landingPageEnabled" BOOLEAN NOT NULL DEFAULT false,
    "landingPageLanguages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "titleEN" TEXT,
    "titlePT" TEXT,
    "titleES" TEXT,
    "synopsisEN" TEXT,
    "synopsisPT" TEXT,
    "synopsisES" TEXT,
    "totalPublicViews" INTEGER NOT NULL DEFAULT 0,
    "totalENViews" INTEGER NOT NULL DEFAULT 0,
    "totalPTViews" INTEGER NOT NULL DEFAULT 0,
    "totalESViews" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" TIMESTAMP(3),
    "totalUniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "uniqueENVisitors" INTEGER NOT NULL DEFAULT 0,
    "uniquePTVisitors" INTEGER NOT NULL DEFAULT 0,
    "uniqueESVisitors" INTEGER NOT NULL DEFAULT 0,
    "creditsAllocated" INTEGER NOT NULL DEFAULT 0,
    "creditsUsed" INTEGER NOT NULL DEFAULT 0,
    "creditsRemaining" INTEGER NOT NULL DEFAULT 0,
    "targetReviews" INTEGER NOT NULL,
    "reviewsPerWeek" INTEGER NOT NULL,
    "weeklyDistribution" BOOLEAN NOT NULL DEFAULT true,
    "currentWeek" INTEGER NOT NULL DEFAULT 0,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "campaignStartDate" TIMESTAMP(3),
    "campaignEndDate" TIMESTAMP(3),
    "expectedEndDate" TIMESTAMP(3),
    "amazonCouponCode" TEXT,
    "requireVerifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
    "overBookingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "overBookingPercent" INTEGER NOT NULL DEFAULT 20,
    "totalAssignedReaders" INTEGER NOT NULL DEFAULT 0,
    "totalReviewsDelivered" INTEGER NOT NULL DEFAULT 0,
    "totalReviewsValidated" INTEGER NOT NULL DEFAULT 0,
    "totalReviewsRejected" INTEGER NOT NULL DEFAULT 0,
    "totalReviewsExpired" INTEGER NOT NULL DEFAULT 0,
    "averageInternalRating" DECIMAL(3,2),
    "manualDistributionOverride" BOOLEAN NOT NULL DEFAULT false,
    "distributionPausedAt" TIMESTAMP(3),
    "distributionResumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignView" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "visitorHash" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewCount" INTEGER NOT NULL DEFAULT 1,
    "lastViewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignMetric" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "assignmentsToday" INTEGER NOT NULL DEFAULT 0,
    "materialsReleasedToday" INTEGER NOT NULL DEFAULT 0,
    "reviewsSubmittedToday" INTEGER NOT NULL DEFAULT 0,
    "reviewsValidatedToday" INTEGER NOT NULL DEFAULT 0,
    "reviewsExpiredToday" INTEGER NOT NULL DEFAULT 0,
    "totalAssignments" INTEGER NOT NULL DEFAULT 0,
    "totalReviewsValidated" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignWeeklySnapshot" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "weekEndDate" TIMESTAMP(3) NOT NULL,
    "plannedAssignments" INTEGER NOT NULL,
    "actualAssignments" INTEGER NOT NULL,
    "plannedReviews" INTEGER NOT NULL,
    "actualReviews" INTEGER NOT NULL,
    "reviewsValidated" INTEGER NOT NULL DEFAULT 0,
    "reviewsExpired" INTEGER NOT NULL DEFAULT 0,
    "reviewsRejected" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignWeeklySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReaderProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentPreference" "ContentPreference" NOT NULL,
    "walletBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalEarned" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalWithdrawn" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "reviewsCompleted" INTEGER NOT NULL DEFAULT 0,
    "reviewsExpired" INTEGER NOT NULL DEFAULT 0,
    "reviewsRejected" INTEGER NOT NULL DEFAULT 0,
    "averageInternalRating" DECIMAL(3,2),
    "reliabilityScore" DECIMAL(5,2),
    "completionRate" DECIMAL(5,2),
    "reviewsRemovedByAmazon" INTEGER NOT NULL DEFAULT 0,
    "removalRate" DECIMAL(5,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "flagReason" TEXT,
    "flaggedAt" TIMESTAMP(3),
    "flaggedBy" TEXT,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "suspendedAt" TIMESTAMP(3),
    "suspendedBy" TEXT,
    "suspendReason" TEXT,
    "adminNotes" TEXT,
    "preferredGenres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReaderProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmazonProfile" (
    "id" TEXT NOT NULL,
    "readerProfileId" TEXT NOT NULL,
    "profileUrl" TEXT NOT NULL,
    "profileName" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AmazonProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReaderAdminNote" (
    "id" TEXT NOT NULL,
    "readerProfileId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReaderAdminNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReaderAssignment" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "readerProfileId" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'WAITING',
    "formatAssigned" "BookFormat" NOT NULL,
    "creditsValue" INTEGER NOT NULL,
    "amazonProfileId" TEXT,
    "queuePosition" INTEGER,
    "scheduledWeek" INTEGER,
    "scheduledDate" TIMESTAMP(3),
    "materialsReleasedAt" TIMESTAMP(3),
    "materialsExpiresAt" TIMESTAMP(3),
    "audioAccessToken" TEXT,
    "audioAccessExpiresAt" TIMESTAMP(3),
    "lastAudioAccessAt" TIMESTAMP(3),
    "ebookDownloadedAt" TIMESTAMP(3),
    "deadlineAt" TIMESTAMP(3),
    "deadlineExtendedAt" TIMESTAMP(3),
    "extensionReason" TEXT,
    "reminder24hSentAt" TIMESTAMP(3),
    "reminder48hSentAt" TIMESTAMP(3),
    "reminder72hSentAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "expirationHandled" BOOLEAN NOT NULL DEFAULT false,
    "isReassignment" BOOLEAN NOT NULL DEFAULT false,
    "originalAssignmentId" TEXT,
    "reassignmentReason" TEXT,
    "reassignedBy" TEXT,
    "reassignedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancelledBy" TEXT,
    "cancellationReason" TEXT,
    "isManualGrant" BOOLEAN NOT NULL DEFAULT false,
    "manualGrantBy" TEXT,
    "manualGrantReason" TEXT,
    "completedAt" TIMESTAMP(3),
    "withdrawnByReader" BOOLEAN NOT NULL DEFAULT false,
    "withdrawnAt" TIMESTAMP(3),
    "withdrawalReason" TEXT,
    "isBufferAssignment" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReaderAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "readerAssignmentId" TEXT NOT NULL,
    "reminderType" "ReminderType" NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "readerAssignmentId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "readerProfileId" TEXT NOT NULL,
    "amazonProfileId" TEXT,
    "amazonReviewLink" TEXT NOT NULL,
    "internalRating" INTEGER NOT NULL,
    "internalFeedback" TEXT NOT NULL,
    "publishedOnAmazon" BOOLEAN NOT NULL DEFAULT false,
    "completedContent" BOOLEAN NOT NULL DEFAULT false,
    "percentageCompleted" INTEGER,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING_SUBMISSION',
    "validatedAt" TIMESTAMP(3),
    "validatedBy" TEXT,
    "hasIssue" BOOLEAN NOT NULL DEFAULT false,
    "issueType" "IssueType",
    "issueNotes" TEXT,
    "removedByAmazon" BOOLEAN NOT NULL DEFAULT false,
    "removalDetectedAt" TIMESTAMP(3),
    "removalDate" TIMESTAMP(3),
    "replacementEligible" BOOLEAN NOT NULL DEFAULT false,
    "replacementProvided" BOOLEAN NOT NULL DEFAULT false,
    "replacementReviewId" TEXT,
    "compensationPaid" BOOLEAN NOT NULL DEFAULT false,
    "compensationAmount" DECIMAL(10,2),
    "compensationPaidAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmazonReviewMonitor" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "amazonReviewLink" TEXT NOT NULL,
    "monitoringStartDate" TIMESTAMP(3) NOT NULL,
    "monitoringEndDate" TIMESTAMP(3) NOT NULL,
    "lastCheckedAt" TIMESTAMP(3),
    "nextCheckAt" TIMESTAMP(3) NOT NULL,
    "checkCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "stillExistsOnAmazon" BOOLEAN NOT NULL DEFAULT true,
    "removalDetectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AmazonReviewMonitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewIssue" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "issueType" "IssueType" NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "IssueSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "IssueResolutionStatus" NOT NULL DEFAULT 'OPEN',
    "resolvedBy" TEXT,
    "resolution" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "readerNotified" BOOLEAN NOT NULL DEFAULT false,
    "resubmissionRequested" BOOLEAN NOT NULL DEFAULT false,
    "reassignmentTriggered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignReport" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "totalReviewsDelivered" INTEGER NOT NULL,
    "totalReviewsValidated" INTEGER NOT NULL,
    "averageRating" DECIMAL(3,2) NOT NULL,
    "fiveStarCount" INTEGER NOT NULL DEFAULT 0,
    "fourStarCount" INTEGER NOT NULL DEFAULT 0,
    "threeStarCount" INTEGER NOT NULL DEFAULT 0,
    "twoStarCount" INTEGER NOT NULL DEFAULT 0,
    "oneStarCount" INTEGER NOT NULL DEFAULT 0,
    "campaignStartDate" TIMESTAMP(3) NOT NULL,
    "campaignEndDate" TIMESTAMP(3) NOT NULL,
    "totalWeeks" INTEGER NOT NULL,
    "anonymousFeedback" TEXT NOT NULL,
    "ratingTrends" TEXT,
    "delaysEncountered" INTEGER NOT NULL DEFAULT 0,
    "replacementsProvided" INTEGER NOT NULL DEFAULT 0,
    "successRate" DECIMAL(5,2) NOT NULL,
    "pdfUrl" TEXT,
    "pdfFileName" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailedAt" TIMESTAMP(3),
    "emailDeliveryStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL,
    "readerProfileId" TEXT NOT NULL,
    "reviewId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" "WalletTransactionType" NOT NULL,
    "description" TEXT NOT NULL,
    "balanceBefore" DECIMAL(10,2) NOT NULL,
    "balanceAfter" DECIMAL(10,2) NOT NULL,
    "performedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutRequest" (
    "id" TEXT NOT NULL,
    "readerProfileId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PayoutRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "paymentMethod" TEXT NOT NULL,
    "paymentDetails" TEXT,
    "processedBy" TEXT,
    "processedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "notes" TEXT,
    "transactionId" TEXT,
    "paidAt" TIMESTAMP(3),
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayoutRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permissions" TEXT[],
    "role" "AdminRole" NOT NULL DEFAULT 'MODERATOR',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CloserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalSales" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalClients" INTEGER NOT NULL DEFAULT 0,
    "totalPackagesSold" INTEGER NOT NULL DEFAULT 0,
    "commissionEnabled" BOOLEAN NOT NULL DEFAULT true,
    "commissionRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "commissionEarned" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "commissionPaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "conversionRate" DECIMAL(5,2),
    "averagePackageSize" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CloserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomPackage" (
    "id" TEXT NOT NULL,
    "closerProfileId" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "description" TEXT,
    "credits" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "validityDays" INTEGER NOT NULL,
    "specialTerms" TEXT,
    "internalNotes" TEXT,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientCompany" TEXT,
    "clientPhone" TEXT,
    "includeKeywordResearch" BOOLEAN NOT NULL DEFAULT false,
    "keywordResearchCredits" INTEGER NOT NULL DEFAULT 0,
    "status" "CustomPackageStatus" NOT NULL DEFAULT 'DRAFT',
    "approvalRequired" BOOLEAN NOT NULL DEFAULT false,
    "approvalStatus" "PackageApprovalStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "paymentLink" TEXT,
    "paymentLinkExpiresAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "viewedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "closerProfileId" TEXT,
    "authorProfileId" TEXT,
    "customPackageId" TEXT,
    "invoiceNumber" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "paymentLink" TEXT,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "stripePaymentId" TEXT,
    "paymentMethod" TEXT,
    "accountCreated" BOOLEAN NOT NULL DEFAULT false,
    "accountCreatedAt" TIMESTAMP(3),
    "autoCreatedUserId" TEXT,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "customSlug" TEXT,
    "commissionRate" DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    "lifetimeCommission" BOOLEAN NOT NULL DEFAULT true,
    "totalEarnings" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "pendingEarnings" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "approvedEarnings" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paidEarnings" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalClicks" INTEGER NOT NULL DEFAULT 0,
    "totalConversions" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DECIMAL(5,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "websiteUrl" TEXT,
    "socialMediaUrls" TEXT,
    "promotionPlan" TEXT,
    "estimatedReach" TEXT,
    "paypalEmail" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliateProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateClick" (
    "id" TEXT NOT NULL,
    "affiliateProfileId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "refererUrl" TEXT,
    "landingPage" TEXT,
    "cookieSet" BOOLEAN NOT NULL DEFAULT false,
    "cookieId" TEXT,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "convertedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffiliateClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateReferral" (
    "id" TEXT NOT NULL,
    "affiliateProfileId" TEXT NOT NULL,
    "referredAuthorId" TEXT NOT NULL,
    "firstClickAt" TIMESTAMP(3),
    "registeredAt" TIMESTAMP(3) NOT NULL,
    "firstPurchaseAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "refererSource" TEXT,
    "cookieId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffiliateReferral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateCommission" (
    "id" TEXT NOT NULL,
    "affiliateProfileId" TEXT NOT NULL,
    "creditPurchaseId" TEXT NOT NULL,
    "referredAuthorId" TEXT NOT NULL,
    "purchaseAmount" DECIMAL(10,2) NOT NULL,
    "commissionAmount" DECIMAL(10,2) NOT NULL,
    "commissionRate" DECIMAL(5,2) NOT NULL,
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "pendingUntil" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliateCommission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliatePayout" (
    "id" TEXT NOT NULL,
    "affiliateProfileId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PayoutRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "paymentMethod" TEXT NOT NULL,
    "paymentDetails" TEXT,
    "processedBy" TEXT,
    "processedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "notes" TEXT,
    "transactionId" TEXT,
    "paidAt" TIMESTAMP(3),
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliatePayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateMarketingMaterial" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "MarketingMaterialType" NOT NULL,
    "fileUrl" TEXT,
    "thumbnailUrl" TEXT,
    "content" TEXT,
    "language" "Language" NOT NULL DEFAULT 'EN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliateMarketingMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "CouponType" NOT NULL,
    "appliesTo" "CouponAppliesTo" NOT NULL,
    "discountPercent" DECIMAL(5,2),
    "discountAmount" DECIMAL(10,2),
    "minimumPurchase" DECIMAL(10,2),
    "minimumCredits" INTEGER,
    "maxUses" INTEGER,
    "maxUsesPerUser" INTEGER NOT NULL DEFAULT 1,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "purpose" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouponUsage" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "creditPurchaseId" TEXT,
    "keywordResearchId" TEXT,
    "discountApplied" DECIMAL(10,2) NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CouponUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeywordResearch" (
    "id" TEXT NOT NULL,
    "authorProfileId" TEXT NOT NULL,
    "bookId" TEXT,
    "bookTitle" TEXT NOT NULL,
    "bookSubtitle" TEXT,
    "genre" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "competingBooks" TEXT,
    "specificKeywords" TEXT,
    "bookLanguage" "Language" NOT NULL,
    "targetMarket" "TargetMarket" NOT NULL DEFAULT 'US',
    "additionalNotes" TEXT,
    "primaryKeywords" TEXT,
    "secondaryKeywords" TEXT,
    "longTailKeywords" TEXT,
    "usageGuidelines" TEXT,
    "kdpSuggestions" TEXT,
    "pdfUrl" TEXT,
    "pdfFileName" TEXT,
    "pdfGeneratedAt" TIMESTAMP(3),
    "status" "KeywordResearchStatus" NOT NULL DEFAULT 'PENDING',
    "processingStartedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "couponId" TEXT,
    "emailedAt" TIMESTAMP(3),
    "emailDelivered" BOOLEAN NOT NULL DEFAULT false,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "lastDownloadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeywordResearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingPage" (
    "id" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "content" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "ctaText" TEXT NOT NULL DEFAULT 'Join Waitlist',
    "ctaLink" TEXT NOT NULL DEFAULT '#',
    "ctaMode" TEXT NOT NULL DEFAULT 'PRE_LAUNCH',
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "totalLeads" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingPageLead" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "language" "Language" NOT NULL,
    "userType" TEXT,
    "source" TEXT,
    "medium" TEXT,
    "campaign" TEXT,
    "content" TEXT,
    "term" TEXT,
    "affiliateRef" TEXT,
    "referrer" TEXT,
    "ipAddress" TEXT,
    "country" TEXT,
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "consentedAt" TIMESTAMP(3),
    "welcomeEmailSent" BOOLEAN NOT NULL DEFAULT false,
    "welcomeEmailSentAt" TIMESTAMP(3),
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "convertedToUserId" TEXT,
    "convertedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LandingPageLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "dataType" TEXT NOT NULL DEFAULT 'string',
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isEditable" BOOLEAN NOT NULL DEFAULT true,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userEmail" TEXT,
    "userRole" "UserRole",
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "changes" TEXT,
    "description" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "severity" "LogSeverity" NOT NULL DEFAULT 'INFO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" TEXT NOT NULL,
    "type" "EmailType" NOT NULL,
    "language" "Language" NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "htmlBody" TEXT NOT NULL,
    "textBody" TEXT NOT NULL,
    "availableVariables" TEXT,
    "description" TEXT,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "type" "EmailType" NOT NULL,
    "subject" TEXT NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "error" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "providerMessageId" TEXT,
    "provider" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" TEXT,
    "actionLabel" TEXT,
    "metadata" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userRole" "UserRole" NOT NULL,
    "type" "DisputeType" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "DisputePriority" NOT NULL DEFAULT 'MEDIUM',
    "relatedEntityType" TEXT,
    "relatedEntityId" TEXT,
    "resolution" TEXT,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "escalatedBy" TEXT,
    "escalatedAt" TIMESTAMP(3),
    "escalationReason" TEXT,
    "firstResponseAt" TIMESTAMP(3),
    "firstResponseBy" TEXT,
    "slaDeadline" TIMESTAMP(3),
    "slaBreached" BOOLEAN NOT NULL DEFAULT false,
    "adminNotes" TEXT,
    "appealedAt" TIMESTAMP(3),
    "appealReason" TEXT,
    "appealStatus" "AppealStatus" DEFAULT 'NONE',
    "appealResolvedBy" TEXT,
    "appealResolvedAt" TIMESTAMP(3),
    "appealResolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentIssue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userRole" "UserRole" NOT NULL,
    "type" "PaymentIssueType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "description" TEXT NOT NULL,
    "stripePaymentId" TEXT,
    "stripeRefundId" TEXT,
    "status" "PaymentIssueStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "DisputePriority" NOT NULL DEFAULT 'HIGH',
    "resolution" TEXT,
    "actionTaken" "PaymentIssueAction",
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReaderBehaviorFlag" (
    "id" TEXT NOT NULL,
    "readerProfileId" TEXT NOT NULL,
    "flagType" "BehaviorFlagType" NOT NULL,
    "severity" "IssueSeverity" NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT NOT NULL,
    "evidenceData" TEXT,
    "scoreImpact" INTEGER NOT NULL DEFAULT 0,
    "status" "BehaviorFlagStatus" NOT NULL DEFAULT 'ACTIVE',
    "investigatedBy" TEXT,
    "investigatedAt" TIMESTAMP(3),
    "investigationNotes" TEXT,
    "actionTaken" TEXT,
    "actionTakenAt" TIMESTAMP(3),
    "actionTakenBy" TEXT,
    "isAutoGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReaderBehaviorFlag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "PasswordReset"("token");

-- CreateIndex
CREATE INDEX "PasswordReset_token_idx" ON "PasswordReset"("token");

-- CreateIndex
CREATE INDEX "PasswordReset_userId_idx" ON "PasswordReset"("userId");

-- CreateIndex
CREATE INDEX "PasswordReset_expiresAt_idx" ON "PasswordReset"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "AuthorProfile_userId_key" ON "AuthorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthorProfile_stripeCustomerId_key" ON "AuthorProfile"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "AuthorProfile_userId_idx" ON "AuthorProfile"("userId");

-- CreateIndex
CREATE INDEX "AuthorProfile_stripeCustomerId_idx" ON "AuthorProfile"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "AuthorProfile_referredByAffiliateId_idx" ON "AuthorProfile"("referredByAffiliateId");

-- CreateIndex
CREATE INDEX "AuthorProfile_referredByCloserId_idx" ON "AuthorProfile"("referredByCloserId");

-- CreateIndex
CREATE UNIQUE INDEX "PackageTier_credits_key" ON "PackageTier"("credits");

-- CreateIndex
CREATE INDEX "PackageTier_credits_idx" ON "PackageTier"("credits");

-- CreateIndex
CREATE INDEX "PackageTier_isActive_idx" ON "PackageTier"("isActive");

-- CreateIndex
CREATE INDEX "PackageTier_displayOrder_idx" ON "PackageTier"("displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CreditPurchase_stripePaymentId_key" ON "CreditPurchase"("stripePaymentId");

-- CreateIndex
CREATE INDEX "CreditPurchase_authorProfileId_idx" ON "CreditPurchase"("authorProfileId");

-- CreateIndex
CREATE INDEX "CreditPurchase_paymentStatus_idx" ON "CreditPurchase"("paymentStatus");

-- CreateIndex
CREATE INDEX "CreditPurchase_purchaseDate_idx" ON "CreditPurchase"("purchaseDate");

-- CreateIndex
CREATE UNIQUE INDEX "RefundRequest_stripeRefundId_key" ON "RefundRequest"("stripeRefundId");

-- CreateIndex
CREATE INDEX "RefundRequest_creditPurchaseId_idx" ON "RefundRequest"("creditPurchaseId");

-- CreateIndex
CREATE INDEX "RefundRequest_authorProfileId_idx" ON "RefundRequest"("authorProfileId");

-- CreateIndex
CREATE INDEX "RefundRequest_status_idx" ON "RefundRequest"("status");

-- CreateIndex
CREATE INDEX "RefundRequest_createdAt_idx" ON "RefundRequest"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_authorProfileId_idx" ON "Subscription"("authorProfileId");

-- CreateIndex
CREATE INDEX "Subscription_stripeSubscriptionId_idx" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "CreditTransaction_authorProfileId_idx" ON "CreditTransaction"("authorProfileId");

-- CreateIndex
CREATE INDEX "CreditTransaction_bookId_idx" ON "CreditTransaction"("bookId");

-- CreateIndex
CREATE INDEX "CreditTransaction_type_idx" ON "CreditTransaction"("type");

-- CreateIndex
CREATE INDEX "CreditTransaction_createdAt_idx" ON "CreditTransaction"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Book_slug_key" ON "Book"("slug");

-- CreateIndex
CREATE INDEX "Book_authorProfileId_idx" ON "Book"("authorProfileId");

-- CreateIndex
CREATE INDEX "Book_status_idx" ON "Book"("status");

-- CreateIndex
CREATE INDEX "Book_asin_idx" ON "Book"("asin");

-- CreateIndex
CREATE INDEX "Book_campaignStartDate_idx" ON "Book"("campaignStartDate");

-- CreateIndex
CREATE INDEX "Book_authorName_idx" ON "Book"("authorName");

-- CreateIndex
CREATE INDEX "Book_genre_idx" ON "Book"("genre");

-- CreateIndex
CREATE INDEX "Book_category_idx" ON "Book"("category");

-- CreateIndex
CREATE INDEX "Book_slug_idx" ON "Book"("slug");

-- CreateIndex
CREATE INDEX "Book_landingPageEnabled_idx" ON "Book"("landingPageEnabled");

-- CreateIndex
CREATE INDEX "Book_createdAt_idx" ON "Book"("createdAt");

-- CreateIndex
CREATE INDEX "Book_status_createdAt_idx" ON "Book"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CampaignView_bookId_idx" ON "CampaignView"("bookId");

-- CreateIndex
CREATE INDEX "CampaignView_visitorHash_idx" ON "CampaignView"("visitorHash");

-- CreateIndex
CREATE INDEX "CampaignView_viewedAt_idx" ON "CampaignView"("viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignView_bookId_visitorHash_language_key" ON "CampaignView"("bookId", "visitorHash", "language");

-- CreateIndex
CREATE INDEX "CampaignMetric_bookId_idx" ON "CampaignMetric"("bookId");

-- CreateIndex
CREATE INDEX "CampaignMetric_date_idx" ON "CampaignMetric"("date");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignMetric_bookId_date_key" ON "CampaignMetric"("bookId", "date");

-- CreateIndex
CREATE INDEX "CampaignWeeklySnapshot_bookId_idx" ON "CampaignWeeklySnapshot"("bookId");

-- CreateIndex
CREATE INDEX "CampaignWeeklySnapshot_weekNumber_idx" ON "CampaignWeeklySnapshot"("weekNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignWeeklySnapshot_bookId_weekNumber_key" ON "CampaignWeeklySnapshot"("bookId", "weekNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ReaderProfile_userId_key" ON "ReaderProfile"("userId");

-- CreateIndex
CREATE INDEX "ReaderProfile_userId_idx" ON "ReaderProfile"("userId");

-- CreateIndex
CREATE INDEX "ReaderProfile_isActive_idx" ON "ReaderProfile"("isActive");

-- CreateIndex
CREATE INDEX "ReaderProfile_isFlagged_idx" ON "ReaderProfile"("isFlagged");

-- CreateIndex
CREATE INDEX "ReaderProfile_reliabilityScore_idx" ON "ReaderProfile"("reliabilityScore");

-- CreateIndex
CREATE INDEX "AmazonProfile_readerProfileId_idx" ON "AmazonProfile"("readerProfileId");

-- CreateIndex
CREATE INDEX "ReaderAdminNote_readerProfileId_idx" ON "ReaderAdminNote"("readerProfileId");

-- CreateIndex
CREATE INDEX "ReaderAdminNote_createdBy_idx" ON "ReaderAdminNote"("createdBy");

-- CreateIndex
CREATE INDEX "ReaderAdminNote_createdAt_idx" ON "ReaderAdminNote"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReaderAssignment_audioAccessToken_key" ON "ReaderAssignment"("audioAccessToken");

-- CreateIndex
CREATE INDEX "ReaderAssignment_bookId_idx" ON "ReaderAssignment"("bookId");

-- CreateIndex
CREATE INDEX "ReaderAssignment_readerProfileId_idx" ON "ReaderAssignment"("readerProfileId");

-- CreateIndex
CREATE INDEX "ReaderAssignment_status_idx" ON "ReaderAssignment"("status");

-- CreateIndex
CREATE INDEX "ReaderAssignment_scheduledDate_idx" ON "ReaderAssignment"("scheduledDate");

-- CreateIndex
CREATE INDEX "ReaderAssignment_deadlineAt_idx" ON "ReaderAssignment"("deadlineAt");

-- CreateIndex
CREATE INDEX "ReaderAssignment_scheduledWeek_idx" ON "ReaderAssignment"("scheduledWeek");

-- CreateIndex
CREATE INDEX "ReaderAssignment_materialsReleasedAt_idx" ON "ReaderAssignment"("materialsReleasedAt");

-- CreateIndex
CREATE INDEX "ReaderAssignment_amazonProfileId_idx" ON "ReaderAssignment"("amazonProfileId");

-- CreateIndex
CREATE INDEX "ReaderAssignment_bookId_status_idx" ON "ReaderAssignment"("bookId", "status");

-- CreateIndex
CREATE INDEX "ReaderAssignment_readerProfileId_status_idx" ON "ReaderAssignment"("readerProfileId", "status");

-- CreateIndex
CREATE INDEX "ReaderAssignment_createdAt_idx" ON "ReaderAssignment"("createdAt");

-- CreateIndex
CREATE INDEX "Reminder_readerAssignmentId_idx" ON "Reminder"("readerAssignmentId");

-- CreateIndex
CREATE INDEX "Reminder_scheduledFor_idx" ON "Reminder"("scheduledFor");

-- CreateIndex
CREATE INDEX "Reminder_emailSent_idx" ON "Reminder"("emailSent");

-- CreateIndex
CREATE UNIQUE INDEX "Review_readerAssignmentId_key" ON "Review"("readerAssignmentId");

-- CreateIndex
CREATE INDEX "Review_bookId_idx" ON "Review"("bookId");

-- CreateIndex
CREATE INDEX "Review_readerProfileId_idx" ON "Review"("readerProfileId");

-- CreateIndex
CREATE INDEX "Review_status_idx" ON "Review"("status");

-- CreateIndex
CREATE INDEX "Review_hasIssue_idx" ON "Review"("hasIssue");

-- CreateIndex
CREATE INDEX "Review_removedByAmazon_idx" ON "Review"("removedByAmazon");

-- CreateIndex
CREATE INDEX "Review_validatedAt_idx" ON "Review"("validatedAt");

-- CreateIndex
CREATE INDEX "Review_submittedAt_idx" ON "Review"("submittedAt");

-- CreateIndex
CREATE INDEX "Review_amazonProfileId_idx" ON "Review"("amazonProfileId");

-- CreateIndex
CREATE INDEX "Review_bookId_status_idx" ON "Review"("bookId", "status");

-- CreateIndex
CREATE INDEX "Review_createdAt_idx" ON "Review"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AmazonReviewMonitor_reviewId_key" ON "AmazonReviewMonitor"("reviewId");

-- CreateIndex
CREATE INDEX "AmazonReviewMonitor_reviewId_idx" ON "AmazonReviewMonitor"("reviewId");

-- CreateIndex
CREATE INDEX "AmazonReviewMonitor_isActive_idx" ON "AmazonReviewMonitor"("isActive");

-- CreateIndex
CREATE INDEX "AmazonReviewMonitor_nextCheckAt_idx" ON "AmazonReviewMonitor"("nextCheckAt");

-- CreateIndex
CREATE INDEX "AmazonReviewMonitor_monitoringEndDate_idx" ON "AmazonReviewMonitor"("monitoringEndDate");

-- CreateIndex
CREATE INDEX "ReviewIssue_reviewId_idx" ON "ReviewIssue"("reviewId");

-- CreateIndex
CREATE INDEX "ReviewIssue_status_idx" ON "ReviewIssue"("status");

-- CreateIndex
CREATE INDEX "ReviewIssue_issueType_idx" ON "ReviewIssue"("issueType");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignReport_bookId_key" ON "CampaignReport"("bookId");

-- CreateIndex
CREATE INDEX "CampaignReport_bookId_idx" ON "CampaignReport"("bookId");

-- CreateIndex
CREATE INDEX "CampaignReport_generatedAt_idx" ON "CampaignReport"("generatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WalletTransaction_reviewId_key" ON "WalletTransaction"("reviewId");

-- CreateIndex
CREATE INDEX "WalletTransaction_readerProfileId_idx" ON "WalletTransaction"("readerProfileId");

-- CreateIndex
CREATE INDEX "WalletTransaction_type_idx" ON "WalletTransaction"("type");

-- CreateIndex
CREATE INDEX "WalletTransaction_createdAt_idx" ON "WalletTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "PayoutRequest_readerProfileId_idx" ON "PayoutRequest"("readerProfileId");

-- CreateIndex
CREATE INDEX "PayoutRequest_status_idx" ON "PayoutRequest"("status");

-- CreateIndex
CREATE INDEX "PayoutRequest_requestedAt_idx" ON "PayoutRequest"("requestedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminProfile_userId_key" ON "AdminProfile"("userId");

-- CreateIndex
CREATE INDEX "AdminProfile_userId_idx" ON "AdminProfile"("userId");

-- CreateIndex
CREATE INDEX "AdminProfile_role_idx" ON "AdminProfile"("role");

-- CreateIndex
CREATE UNIQUE INDEX "CloserProfile_userId_key" ON "CloserProfile"("userId");

-- CreateIndex
CREATE INDEX "CloserProfile_userId_idx" ON "CloserProfile"("userId");

-- CreateIndex
CREATE INDEX "CloserProfile_isActive_idx" ON "CloserProfile"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "CustomPackage_paymentLink_key" ON "CustomPackage"("paymentLink");

-- CreateIndex
CREATE INDEX "CustomPackage_closerProfileId_idx" ON "CustomPackage"("closerProfileId");

-- CreateIndex
CREATE INDEX "CustomPackage_status_idx" ON "CustomPackage"("status");

-- CreateIndex
CREATE INDEX "CustomPackage_clientEmail_idx" ON "CustomPackage"("clientEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_customPackageId_key" ON "Invoice"("customPackageId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_stripePaymentId_key" ON "Invoice"("stripePaymentId");

-- CreateIndex
CREATE INDEX "Invoice_invoiceNumber_idx" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_paymentStatus_idx" ON "Invoice"("paymentStatus");

-- CreateIndex
CREATE INDEX "Invoice_closerProfileId_idx" ON "Invoice"("closerProfileId");

-- CreateIndex
CREATE INDEX "Invoice_authorProfileId_idx" ON "Invoice"("authorProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateProfile_userId_key" ON "AffiliateProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateProfile_referralCode_key" ON "AffiliateProfile"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateProfile_customSlug_key" ON "AffiliateProfile"("customSlug");

-- CreateIndex
CREATE INDEX "AffiliateProfile_userId_idx" ON "AffiliateProfile"("userId");

-- CreateIndex
CREATE INDEX "AffiliateProfile_referralCode_idx" ON "AffiliateProfile"("referralCode");

-- CreateIndex
CREATE INDEX "AffiliateProfile_customSlug_idx" ON "AffiliateProfile"("customSlug");

-- CreateIndex
CREATE INDEX "AffiliateProfile_isApproved_idx" ON "AffiliateProfile"("isApproved");

-- CreateIndex
CREATE INDEX "AffiliateProfile_isActive_idx" ON "AffiliateProfile"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateClick_cookieId_key" ON "AffiliateClick"("cookieId");

-- CreateIndex
CREATE INDEX "AffiliateClick_affiliateProfileId_idx" ON "AffiliateClick"("affiliateProfileId");

-- CreateIndex
CREATE INDEX "AffiliateClick_cookieId_idx" ON "AffiliateClick"("cookieId");

-- CreateIndex
CREATE INDEX "AffiliateClick_converted_idx" ON "AffiliateClick"("converted");

-- CreateIndex
CREATE INDEX "AffiliateClick_clickedAt_idx" ON "AffiliateClick"("clickedAt");

-- CreateIndex
CREATE INDEX "AffiliateReferral_affiliateProfileId_idx" ON "AffiliateReferral"("affiliateProfileId");

-- CreateIndex
CREATE INDEX "AffiliateReferral_referredAuthorId_idx" ON "AffiliateReferral"("referredAuthorId");

-- CreateIndex
CREATE INDEX "AffiliateReferral_registeredAt_idx" ON "AffiliateReferral"("registeredAt");

-- CreateIndex
CREATE INDEX "AffiliateCommission_affiliateProfileId_idx" ON "AffiliateCommission"("affiliateProfileId");

-- CreateIndex
CREATE INDEX "AffiliateCommission_creditPurchaseId_idx" ON "AffiliateCommission"("creditPurchaseId");

-- CreateIndex
CREATE INDEX "AffiliateCommission_status_idx" ON "AffiliateCommission"("status");

-- CreateIndex
CREATE INDEX "AffiliateCommission_referredAuthorId_idx" ON "AffiliateCommission"("referredAuthorId");

-- CreateIndex
CREATE INDEX "AffiliateCommission_affiliateProfileId_status_idx" ON "AffiliateCommission"("affiliateProfileId", "status");

-- CreateIndex
CREATE INDEX "AffiliatePayout_affiliateProfileId_idx" ON "AffiliatePayout"("affiliateProfileId");

-- CreateIndex
CREATE INDEX "AffiliatePayout_status_idx" ON "AffiliatePayout"("status");

-- CreateIndex
CREATE INDEX "AffiliatePayout_requestedAt_idx" ON "AffiliatePayout"("requestedAt");

-- CreateIndex
CREATE INDEX "AffiliateMarketingMaterial_type_idx" ON "AffiliateMarketingMaterial"("type");

-- CreateIndex
CREATE INDEX "AffiliateMarketingMaterial_language_idx" ON "AffiliateMarketingMaterial"("language");

-- CreateIndex
CREATE INDEX "AffiliateMarketingMaterial_isActive_idx" ON "AffiliateMarketingMaterial"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_code_idx" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_isActive_idx" ON "Coupon"("isActive");

-- CreateIndex
CREATE INDEX "Coupon_validFrom_idx" ON "Coupon"("validFrom");

-- CreateIndex
CREATE INDEX "Coupon_validUntil_idx" ON "Coupon"("validUntil");

-- CreateIndex
CREATE INDEX "CouponUsage_couponId_idx" ON "CouponUsage"("couponId");

-- CreateIndex
CREATE INDEX "CouponUsage_userId_idx" ON "CouponUsage"("userId");

-- CreateIndex
CREATE INDEX "CouponUsage_userEmail_idx" ON "CouponUsage"("userEmail");

-- CreateIndex
CREATE INDEX "CouponUsage_usedAt_idx" ON "CouponUsage"("usedAt");

-- CreateIndex
CREATE UNIQUE INDEX "KeywordResearch_bookId_key" ON "KeywordResearch"("bookId");

-- CreateIndex
CREATE INDEX "KeywordResearch_authorProfileId_idx" ON "KeywordResearch"("authorProfileId");

-- CreateIndex
CREATE INDEX "KeywordResearch_bookId_idx" ON "KeywordResearch"("bookId");

-- CreateIndex
CREATE INDEX "KeywordResearch_status_idx" ON "KeywordResearch"("status");

-- CreateIndex
CREATE UNIQUE INDEX "LandingPage_language_key" ON "LandingPage"("language");

-- CreateIndex
CREATE INDEX "LandingPage_language_idx" ON "LandingPage"("language");

-- CreateIndex
CREATE INDEX "LandingPage_isPublished_idx" ON "LandingPage"("isPublished");

-- CreateIndex
CREATE INDEX "LandingPageLead_email_idx" ON "LandingPageLead"("email");

-- CreateIndex
CREATE INDEX "LandingPageLead_language_idx" ON "LandingPageLead"("language");

-- CreateIndex
CREATE INDEX "LandingPageLead_userType_idx" ON "LandingPageLead"("userType");

-- CreateIndex
CREATE INDEX "LandingPageLead_source_idx" ON "LandingPageLead"("source");

-- CreateIndex
CREATE INDEX "LandingPageLead_converted_idx" ON "LandingPageLead"("converted");

-- CreateIndex
CREATE INDEX "LandingPageLead_createdAt_idx" ON "LandingPageLead"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE INDEX "SystemSetting_key_idx" ON "SystemSetting"("key");

-- CreateIndex
CREATE INDEX "SystemSetting_category_idx" ON "SystemSetting"("category");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_severity_idx" ON "AuditLog"("severity");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "EmailTemplate_type_idx" ON "EmailTemplate"("type");

-- CreateIndex
CREATE INDEX "EmailTemplate_language_idx" ON "EmailTemplate"("language");

-- CreateIndex
CREATE INDEX "EmailTemplate_isActive_idx" ON "EmailTemplate"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_type_language_isDefault_key" ON "EmailTemplate"("type", "language", "isDefault");

-- CreateIndex
CREATE INDEX "EmailLog_userId_idx" ON "EmailLog"("userId");

-- CreateIndex
CREATE INDEX "EmailLog_email_idx" ON "EmailLog"("email");

-- CreateIndex
CREATE INDEX "EmailLog_type_idx" ON "EmailLog"("type");

-- CreateIndex
CREATE INDEX "EmailLog_status_idx" ON "EmailLog"("status");

-- CreateIndex
CREATE INDEX "EmailLog_createdAt_idx" ON "EmailLog"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Dispute_userId_idx" ON "Dispute"("userId");

-- CreateIndex
CREATE INDEX "Dispute_userRole_idx" ON "Dispute"("userRole");

-- CreateIndex
CREATE INDEX "Dispute_type_idx" ON "Dispute"("type");

-- CreateIndex
CREATE INDEX "Dispute_status_idx" ON "Dispute"("status");

-- CreateIndex
CREATE INDEX "Dispute_priority_idx" ON "Dispute"("priority");

-- CreateIndex
CREATE INDEX "Dispute_relatedEntityType_relatedEntityId_idx" ON "Dispute"("relatedEntityType", "relatedEntityId");

-- CreateIndex
CREATE INDEX "Dispute_createdAt_idx" ON "Dispute"("createdAt");

-- CreateIndex
CREATE INDEX "Dispute_slaBreached_idx" ON "Dispute"("slaBreached");

-- CreateIndex
CREATE INDEX "Dispute_appealStatus_idx" ON "Dispute"("appealStatus");

-- CreateIndex
CREATE INDEX "PaymentIssue_userId_idx" ON "PaymentIssue"("userId");

-- CreateIndex
CREATE INDEX "PaymentIssue_userRole_idx" ON "PaymentIssue"("userRole");

-- CreateIndex
CREATE INDEX "PaymentIssue_type_idx" ON "PaymentIssue"("type");

-- CreateIndex
CREATE INDEX "PaymentIssue_status_idx" ON "PaymentIssue"("status");

-- CreateIndex
CREATE INDEX "PaymentIssue_priority_idx" ON "PaymentIssue"("priority");

-- CreateIndex
CREATE INDEX "PaymentIssue_stripePaymentId_idx" ON "PaymentIssue"("stripePaymentId");

-- CreateIndex
CREATE INDEX "PaymentIssue_createdAt_idx" ON "PaymentIssue"("createdAt");

-- CreateIndex
CREATE INDEX "ReaderBehaviorFlag_readerProfileId_idx" ON "ReaderBehaviorFlag"("readerProfileId");

-- CreateIndex
CREATE INDEX "ReaderBehaviorFlag_flagType_idx" ON "ReaderBehaviorFlag"("flagType");

-- CreateIndex
CREATE INDEX "ReaderBehaviorFlag_status_idx" ON "ReaderBehaviorFlag"("status");

-- CreateIndex
CREATE INDEX "ReaderBehaviorFlag_severity_idx" ON "ReaderBehaviorFlag"("severity");

-- CreateIndex
CREATE INDEX "ReaderBehaviorFlag_isAutoGenerated_idx" ON "ReaderBehaviorFlag"("isAutoGenerated");

-- CreateIndex
CREATE INDEX "ReaderBehaviorFlag_createdAt_idx" ON "ReaderBehaviorFlag"("createdAt");

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorProfile" ADD CONSTRAINT "AuthorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditPurchase" ADD CONSTRAINT "CreditPurchase_authorProfileId_fkey" FOREIGN KEY ("authorProfileId") REFERENCES "AuthorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditPurchase" ADD CONSTRAINT "CreditPurchase_packageTierId_fkey" FOREIGN KEY ("packageTierId") REFERENCES "PackageTier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditPurchase" ADD CONSTRAINT "CreditPurchase_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_creditPurchaseId_fkey" FOREIGN KEY ("creditPurchaseId") REFERENCES "CreditPurchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_authorProfileId_fkey" FOREIGN KEY ("authorProfileId") REFERENCES "AuthorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_authorProfileId_fkey" FOREIGN KEY ("authorProfileId") REFERENCES "AuthorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_authorProfileId_fkey" FOREIGN KEY ("authorProfileId") REFERENCES "AuthorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_authorProfileId_fkey" FOREIGN KEY ("authorProfileId") REFERENCES "AuthorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignView" ADD CONSTRAINT "CampaignView_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignMetric" ADD CONSTRAINT "CampaignMetric_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignWeeklySnapshot" ADD CONSTRAINT "CampaignWeeklySnapshot_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReaderProfile" ADD CONSTRAINT "ReaderProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmazonProfile" ADD CONSTRAINT "AmazonProfile_readerProfileId_fkey" FOREIGN KEY ("readerProfileId") REFERENCES "ReaderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReaderAdminNote" ADD CONSTRAINT "ReaderAdminNote_readerProfileId_fkey" FOREIGN KEY ("readerProfileId") REFERENCES "ReaderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReaderAdminNote" ADD CONSTRAINT "ReaderAdminNote_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReaderAssignment" ADD CONSTRAINT "ReaderAssignment_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReaderAssignment" ADD CONSTRAINT "ReaderAssignment_readerProfileId_fkey" FOREIGN KEY ("readerProfileId") REFERENCES "ReaderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReaderAssignment" ADD CONSTRAINT "ReaderAssignment_amazonProfileId_fkey" FOREIGN KEY ("amazonProfileId") REFERENCES "AmazonProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_readerAssignmentId_fkey" FOREIGN KEY ("readerAssignmentId") REFERENCES "ReaderAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_readerAssignmentId_fkey" FOREIGN KEY ("readerAssignmentId") REFERENCES "ReaderAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_readerProfileId_fkey" FOREIGN KEY ("readerProfileId") REFERENCES "ReaderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_amazonProfileId_fkey" FOREIGN KEY ("amazonProfileId") REFERENCES "AmazonProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmazonReviewMonitor" ADD CONSTRAINT "AmazonReviewMonitor_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewIssue" ADD CONSTRAINT "ReviewIssue_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignReport" ADD CONSTRAINT "CampaignReport_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_readerProfileId_fkey" FOREIGN KEY ("readerProfileId") REFERENCES "ReaderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutRequest" ADD CONSTRAINT "PayoutRequest_readerProfileId_fkey" FOREIGN KEY ("readerProfileId") REFERENCES "ReaderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminProfile" ADD CONSTRAINT "AdminProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CloserProfile" ADD CONSTRAINT "CloserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomPackage" ADD CONSTRAINT "CustomPackage_closerProfileId_fkey" FOREIGN KEY ("closerProfileId") REFERENCES "CloserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_closerProfileId_fkey" FOREIGN KEY ("closerProfileId") REFERENCES "CloserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_authorProfileId_fkey" FOREIGN KEY ("authorProfileId") REFERENCES "AuthorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customPackageId_fkey" FOREIGN KEY ("customPackageId") REFERENCES "CustomPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateProfile" ADD CONSTRAINT "AffiliateProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateClick" ADD CONSTRAINT "AffiliateClick_affiliateProfileId_fkey" FOREIGN KEY ("affiliateProfileId") REFERENCES "AffiliateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateReferral" ADD CONSTRAINT "AffiliateReferral_affiliateProfileId_fkey" FOREIGN KEY ("affiliateProfileId") REFERENCES "AffiliateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateCommission" ADD CONSTRAINT "AffiliateCommission_affiliateProfileId_fkey" FOREIGN KEY ("affiliateProfileId") REFERENCES "AffiliateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateCommission" ADD CONSTRAINT "AffiliateCommission_creditPurchaseId_fkey" FOREIGN KEY ("creditPurchaseId") REFERENCES "CreditPurchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliatePayout" ADD CONSTRAINT "AffiliatePayout_affiliateProfileId_fkey" FOREIGN KEY ("affiliateProfileId") REFERENCES "AffiliateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeywordResearch" ADD CONSTRAINT "KeywordResearch_authorProfileId_fkey" FOREIGN KEY ("authorProfileId") REFERENCES "AuthorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeywordResearch" ADD CONSTRAINT "KeywordResearch_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeywordResearch" ADD CONSTRAINT "KeywordResearch_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

