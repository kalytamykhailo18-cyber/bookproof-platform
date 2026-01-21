/*
  Warnings:

  - Made the column `commissionRate` on table `CloserProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "PackageApprovalStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "CustomPackageStatus" ADD VALUE 'PENDING_APPROVAL';

-- AlterTable
ALTER TABLE "CloserProfile" ALTER COLUMN "commissionEnabled" SET DEFAULT true,
ALTER COLUMN "commissionRate" SET NOT NULL,
ALTER COLUMN "commissionRate" SET DEFAULT 30;

-- AlterTable
ALTER TABLE "CustomPackage" ADD COLUMN     "approvalRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "approvalStatus" "PackageApprovalStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "rejectionReason" TEXT;
