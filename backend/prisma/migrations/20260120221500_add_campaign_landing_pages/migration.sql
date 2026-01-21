-- Add campaign landing page fields to Book model
-- Per Milestone 2.2: Landing Page Generation

-- Add slug field for public URLs
ALTER TABLE "Book" ADD COLUMN "slug" TEXT;

-- Add landing page configuration
ALTER TABLE "Book" ADD COLUMN "landingPageEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Book" ADD COLUMN "landingPageLanguages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Add language-specific titles
ALTER TABLE "Book" ADD COLUMN "titleEN" TEXT;
ALTER TABLE "Book" ADD COLUMN "titlePT" TEXT;
ALTER TABLE "Book" ADD COLUMN "titleES" TEXT;

-- Add language-specific synopsis
ALTER TABLE "Book" ADD COLUMN "synopsisEN" TEXT;
ALTER TABLE "Book" ADD COLUMN "synopsisPT" TEXT;
ALTER TABLE "Book" ADD COLUMN "synopsisES" TEXT;

-- Add view tracking fields
ALTER TABLE "Book" ADD COLUMN "totalPublicViews" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Book" ADD COLUMN "totalENViews" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Book" ADD COLUMN "totalPTViews" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Book" ADD COLUMN "totalESViews" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Book" ADD COLUMN "lastViewedAt" TIMESTAMP(3);

-- Create unique constraint on slug
CREATE UNIQUE INDEX "Book_slug_key" ON "Book"("slug");

-- Create indexes for performance
CREATE INDEX "Book_slug_idx" ON "Book"("slug");
CREATE INDEX "Book_landingPageEnabled_idx" ON "Book"("landingPageEnabled");

-- Add comment
COMMENT ON COLUMN "Book"."slug" IS 'URL-safe unique identifier for public campaign landing pages';
COMMENT ON COLUMN "Book"."landingPageEnabled" IS 'Whether public landing page is enabled for this campaign';
COMMENT ON COLUMN "Book"."landingPageLanguages" IS 'Array of enabled languages for landing page (EN, PT, ES)';
