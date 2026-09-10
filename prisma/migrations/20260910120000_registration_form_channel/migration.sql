-- Registration form channel (Spyurk RF vs general Armenia landing)
-- Risk: LOW — additive enum + NOT NULL column with DEFAULT; existing rows become GENERAL.
-- Production apply: owner only (do not auto-apply in this change).

CREATE TYPE "FormChannel" AS ENUM ('GENERAL', 'SPYURK_RF');

ALTER TABLE "Registration"
ADD COLUMN "formChannel" "FormChannel" NOT NULL DEFAULT 'GENERAL';

CREATE INDEX "Registration_eventId_formChannel_idx" ON "Registration"("eventId", "formChannel");
