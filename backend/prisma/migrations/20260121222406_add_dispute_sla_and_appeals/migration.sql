-- CreateEnum
CREATE TYPE "AppealStatus" AS ENUM ('NONE', 'PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "EmailType" ADD VALUE 'ADMIN_NOTIFICATION';

-- AlterTable
ALTER TABLE "Dispute" ADD COLUMN     "appealReason" TEXT,
ADD COLUMN     "appealResolution" TEXT,
ADD COLUMN     "appealResolvedAt" TIMESTAMP(3),
ADD COLUMN     "appealResolvedBy" TEXT,
ADD COLUMN     "appealStatus" "AppealStatus" DEFAULT 'NONE',
ADD COLUMN     "appealedAt" TIMESTAMP(3),
ADD COLUMN     "firstResponseAt" TIMESTAMP(3),
ADD COLUMN     "firstResponseBy" TEXT,
ADD COLUMN     "slaBreached" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slaDeadline" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "bannedAt" TIMESTAMP(3),
ADD COLUMN     "bannedBy" TEXT,
ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Dispute_slaBreached_idx" ON "Dispute"("slaBreached");

-- CreateIndex
CREATE INDEX "Dispute_appealStatus_idx" ON "Dispute"("appealStatus");
