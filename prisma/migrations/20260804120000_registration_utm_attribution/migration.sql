-- Registration marketing UTM attribution
-- Risk: LOW — additive nullable columns only; no backfill, indexes, or NOT NULL.
-- Production apply: owner only (do not auto-apply in this change).

-- AlterTable
ALTER TABLE "Registration"
ADD COLUMN "utmSource" TEXT,
ADD COLUMN "utmMedium" TEXT,
ADD COLUMN "utmCampaign" TEXT;
