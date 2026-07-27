-- Ticketing + integrations expand migration
-- Risk: MEDIUM — additive nullable columns/tables + drop email uniqueness (approved owner decision).
-- Does not backfill ticket codes or add NOT NULL constraints (later phase).
-- Production apply: owner only.

-- CreateEnum
CREATE TYPE "SourceSystem" AS ENUM ('TOON_EXPO', 'MOOTQ');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('NOT_VISITED', 'VISITED');

-- CreateEnum
CREATE TYPE "DeliveryChannel" AS ENUM ('EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "DeliveryJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "PartnerFeedEventType" AS ENUM ('UPSERT');

-- CreateEnum
CREATE TYPE "IntegrationSyncDirection" AS ENUM ('IMPORT_FROM_MQ', 'EXPORT_TO_MQ');

-- CreateEnum
CREATE TYPE "IntegrationSyncStatus" AS ENUM ('RUNNING', 'SUCCEEDED', 'PARTIAL', 'FAILED');

-- AlterTable: registration ticket/source fields (nullable for expand + legacy rows)
ALTER TABLE "Registration"
ADD COLUMN "sourceSystem" "SourceSystem",
ADD COLUMN "sourceRegistrationId" TEXT,
ADD COLUMN "ticketCode" TEXT,
ADD COLUMN "ticketViewToken" TEXT,
ADD COLUMN "attendanceStatus" "AttendanceStatus",
ADD COLUMN "idempotencyKey" TEXT;

-- Drop email uniqueness (owner: same email may register multiple participants)
DROP INDEX IF EXISTS "Registration_eventId_emailNormalized_key";

-- Non-unique search index for email
CREATE INDEX "Registration_eventId_emailNormalized_idx" ON "Registration"("eventId", "emailNormalized");

-- Ticket / source / idempotency indexes
CREATE UNIQUE INDEX "Registration_ticketCode_key" ON "Registration"("ticketCode");
CREATE UNIQUE INDEX "Registration_ticketViewToken_key" ON "Registration"("ticketViewToken");
CREATE UNIQUE INDEX "Registration_eventId_idempotencyKey_key" ON "Registration"("eventId", "idempotencyKey");
CREATE UNIQUE INDEX "Registration_sourceSystem_sourceRegistrationId_key" ON "Registration"("sourceSystem", "sourceRegistrationId");
CREATE INDEX "Registration_eventId_sourceSystem_idx" ON "Registration"("eventId", "sourceSystem");

-- CreateTable
CREATE TABLE "DeliveryJob" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "channel" "DeliveryChannel" NOT NULL,
    "templateVersion" TEXT NOT NULL,
    "status" "DeliveryJobStatus" NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "providerMessageId" TEXT,
    "lastErrorCode" TEXT,
    "claimedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerFeedEvent" (
    "id" TEXT NOT NULL,
    "sequence" BIGSERIAL NOT NULL,
    "registrationId" TEXT NOT NULL,
    "type" "PartnerFeedEventType" NOT NULL DEFAULT 'UPSERT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerFeedEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationSyncRun" (
    "id" TEXT NOT NULL,
    "direction" "IntegrationSyncDirection" NOT NULL,
    "status" "IntegrationSyncStatus" NOT NULL DEFAULT 'RUNNING',
    "initiatedBy" TEXT NOT NULL,
    "lastCursor" TEXT,
    "readCount" INTEGER NOT NULL DEFAULT 0,
    "createdCount" INTEGER NOT NULL DEFAULT 0,
    "updatedCount" INTEGER NOT NULL DEFAULT 0,
    "skippedCount" INTEGER NOT NULL DEFAULT 0,
    "conflictCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "errorSummary" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationSyncRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryJob_registrationId_channel_templateVersion_key" ON "DeliveryJob"("registrationId", "channel", "templateVersion");
CREATE INDEX "DeliveryJob_status_nextAttemptAt_idx" ON "DeliveryJob"("status", "nextAttemptAt");

CREATE UNIQUE INDEX "PartnerFeedEvent_sequence_key" ON "PartnerFeedEvent"("sequence");
CREATE INDEX "PartnerFeedEvent_createdAt_idx" ON "PartnerFeedEvent"("createdAt");

CREATE INDEX "IntegrationSyncRun_direction_startedAt_idx" ON "IntegrationSyncRun"("direction", "startedAt");

-- AddForeignKey
ALTER TABLE "DeliveryJob" ADD CONSTRAINT "DeliveryJob_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PartnerFeedEvent" ADD CONSTRAINT "PartnerFeedEvent_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
