-- AlterTable CustomPackage - Add payment tracking fields (Section 5.5)
ALTER TABLE "CustomPackage" ADD COLUMN "paidAt" TIMESTAMP(3);
ALTER TABLE "CustomPackage" ADD COLUMN "stripePaymentId" TEXT;
ALTER TABLE "CustomPackage" ADD COLUMN "accountCreated" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "CustomPackage_stripePaymentId_key" ON "CustomPackage"("stripePaymentId");
