-- Add missing indexes for ReaderProfile table to optimize admin reader queries

-- Single column indexes
CREATE INDEX IF NOT EXISTS "ReaderProfile_isSuspended_idx" ON "ReaderProfile"("isSuspended");
CREATE INDEX IF NOT EXISTS "ReaderProfile_contentPreference_idx" ON "ReaderProfile"("contentPreference");

-- Compound indexes for multi-field filters
CREATE INDEX IF NOT EXISTS "ReaderProfile_isActive_isSuspended_idx" ON "ReaderProfile"("isActive", "isSuspended");
CREATE INDEX IF NOT EXISTS "ReaderProfile_isActive_contentPreference_idx" ON "ReaderProfile"("isActive", "contentPreference");
CREATE INDEX IF NOT EXISTS "ReaderProfile_isFlagged_contentPreference_idx" ON "ReaderProfile"("isFlagged", "contentPreference");
