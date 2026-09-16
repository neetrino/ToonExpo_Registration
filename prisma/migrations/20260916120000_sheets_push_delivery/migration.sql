-- SheetsPushDelivery outbox for Toon Expo → Google Sheets Apps Script webhook
-- Risk: LOW — additive independent table; no backfill required.
-- Existing registrations are not auto-synced; only new TOON_EXPO creates enqueue a row.
-- Production apply: owner only (do not auto-apply in this change).

-- CreateTable
CREATE TABLE "SheetsPushDelivery" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "status" "DeliveryJobStatus" NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastErrorCode" TEXT,
    "claimedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SheetsPushDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SheetsPushDelivery_registrationId_key" ON "SheetsPushDelivery"("registrationId");

-- CreateIndex
CREATE INDEX "SheetsPushDelivery_status_nextAttemptAt_idx" ON "SheetsPushDelivery"("status", "nextAttemptAt");

-- AddForeignKey
ALTER TABLE "SheetsPushDelivery" ADD CONSTRAINT "SheetsPushDelivery_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
