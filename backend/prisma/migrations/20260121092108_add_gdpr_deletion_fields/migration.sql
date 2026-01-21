/*
  Warnings:

  - You are about to drop the column `credits` on the `CreditPurchase` table. All the data in the column will be lost.
  - Added the required column `creditsAmount` to the `CreditPurchase` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RefundReason" AS ENUM ('DIDNT_NEED_CREDITS', 'WRONG_PACKAGE', 'ACCIDENTAL_PURCHASE', 'SERVICE_NOT_AS_EXPECTED', 'OTHER');

-- CreateEnum
CREATE TYPE "RefundRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED');

-- AlterEnum
ALTER TYPE "EmailType" ADD VALUE 'ADMIN_CRITICAL_ERROR';

-- AlterTable
ALTER TABLE "CreditPurchase" DROP COLUMN "credits",
ADD COLUMN     "activationWindowDays" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "baseAmount" DECIMAL(10,2),
ADD COLUMN     "creditsAmount" INTEGER NOT NULL,
ADD COLUMN     "discountAmount" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletionReason" TEXT,
ADD COLUMN     "deletionScheduledAt" TIMESTAMP(3);

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

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_creditPurchaseId_fkey" FOREIGN KEY ("creditPurchaseId") REFERENCES "CreditPurchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_authorProfileId_fkey" FOREIGN KEY ("authorProfileId") REFERENCES "AuthorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
