-- CreateEnum
CREATE TYPE "AdminEventType" AS ENUM ('STATUS_CHANGED', 'ATTACHMENT_ADDED', 'ATTACHMENT_DELETED', 'NOTE_ADDED', 'REOPENED');

-- CreateTable
CREATE TABLE "AdminEvent" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" "AdminEventType" NOT NULL,
    "actorClerkId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminEvent_applicationId_createdAt_idx" ON "AdminEvent"("applicationId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminEvent_type_createdAt_idx" ON "AdminEvent"("type", "createdAt");

-- AddForeignKey
ALTER TABLE "AdminEvent" ADD CONSTRAINT "AdminEvent_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
