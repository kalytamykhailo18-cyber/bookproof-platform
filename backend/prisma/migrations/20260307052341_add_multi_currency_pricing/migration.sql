-- CreateTable
CREATE TABLE "PackageTierPrice" (
    "id" TEXT NOT NULL,
    "packageTierId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageTierPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PackageTierPrice_packageTierId_idx" ON "PackageTierPrice"("packageTierId");

-- CreateIndex
CREATE INDEX "PackageTierPrice_currency_idx" ON "PackageTierPrice"("currency");

-- CreateIndex
CREATE UNIQUE INDEX "PackageTierPrice_packageTierId_currency_key" ON "PackageTierPrice"("packageTierId", "currency");

-- AddForeignKey
ALTER TABLE "PackageTierPrice" ADD CONSTRAINT "PackageTierPrice_packageTierId_fkey" FOREIGN KEY ("packageTierId") REFERENCES "PackageTier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
