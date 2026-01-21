-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "totalUniqueVisitors" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "uniqueENVisitors" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "uniqueESVisitors" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "uniquePTVisitors" INTEGER NOT NULL DEFAULT 0;

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

-- CreateIndex
CREATE INDEX "CampaignView_bookId_idx" ON "CampaignView"("bookId");

-- CreateIndex
CREATE INDEX "CampaignView_visitorHash_idx" ON "CampaignView"("visitorHash");

-- CreateIndex
CREATE INDEX "CampaignView_viewedAt_idx" ON "CampaignView"("viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignView_bookId_visitorHash_language_key" ON "CampaignView"("bookId", "visitorHash", "language");

-- AddForeignKey
ALTER TABLE "CampaignView" ADD CONSTRAINT "CampaignView_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
