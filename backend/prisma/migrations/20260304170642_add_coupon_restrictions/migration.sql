-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EmailType" ADD VALUE 'READER_PAYOUT_REQUESTED';
ALTER TYPE "EmailType" ADD VALUE 'AUTHOR_SUSPENDED';
ALTER TYPE "EmailType" ADD VALUE 'AUTHOR_UNSUSPENDED';

-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "firstPurchaseOnly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxDiscountAmount" DECIMAL(10,2),
ADD COLUMN     "specificUserEmail" TEXT;
