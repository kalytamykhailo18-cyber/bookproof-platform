-- AlterTable
ALTER TABLE "AmazonProfile" ADD COLUMN     "verifiedBy" TEXT;

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "secondaryGenre" TEXT;

-- AlterTable
ALTER TABLE "CloserProfile" ALTER COLUMN "commissionRate" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "CustomPackage" ADD COLUMN     "clientPhone" TEXT,
ADD COLUMN     "includeKeywordResearch" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "keywordResearchCredits" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ReaderAssignment" ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "isManualGrant" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "manualGrantBy" TEXT,
ADD COLUMN     "manualGrantReason" TEXT;

-- CreateTable
CREATE TABLE "ReaderAdminNote" (
    "id" TEXT NOT NULL,
    "readerProfileId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReaderAdminNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReaderAdminNote_readerProfileId_idx" ON "ReaderAdminNote"("readerProfileId");

-- CreateIndex
CREATE INDEX "ReaderAdminNote_createdBy_idx" ON "ReaderAdminNote"("createdBy");

-- CreateIndex
CREATE INDEX "ReaderAdminNote_createdAt_idx" ON "ReaderAdminNote"("createdAt");

-- AddForeignKey
ALTER TABLE "ReaderAdminNote" ADD CONSTRAINT "ReaderAdminNote_readerProfileId_fkey" FOREIGN KEY ("readerProfileId") REFERENCES "ReaderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReaderAdminNote" ADD CONSTRAINT "ReaderAdminNote_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
