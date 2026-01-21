-- Rename the creditsAmount column to credits (preserves data)
ALTER TABLE "CreditPurchase" RENAME COLUMN "creditsAmount" TO "credits";
