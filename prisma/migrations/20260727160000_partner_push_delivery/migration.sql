-- PartnerPushDelivery outbox for Toon Expo → Mootq fast push
-- Risk: LOW — additive independent table; no backfill required.
-- PartnerFeedEvent remains pull-feed cursor only.
-- Production apply: owner only (do not auto-apply in this change).

-- CreateTable
CREATE TABLE "PartnerPushDelivery" (
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

    CONSTRAINT "PartnerPushDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PartnerPushDelivery_registrationId_key" ON "PartnerPushDelivery"("registrationId");

-- CreateIndex
CREATE INDEX "PartnerPushDelivery_status_nextAttemptAt_idx" ON "PartnerPushDelivery"("status", "nextAttemptAt");

-- AddForeignKey
ALTER TABLE "PartnerPushDelivery" ADD CONSTRAINT "PartnerPushDelivery_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
