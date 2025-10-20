/*
  Warnings:

  - You are about to drop the `CommonerAttachment` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AttachmentKind" ADD VALUE 'PROOF_OF_LINEAGE';
ALTER TYPE "AttachmentKind" ADD VALUE 'BUSINESS_PLAN';

-- DropForeignKey
ALTER TABLE "public"."CommonerAttachment" DROP CONSTRAINT "CommonerAttachment_commonerId_fkey";

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "commonerId" TEXT;

-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "commonerId" TEXT,
ALTER COLUMN "applicationId" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."CommonerAttachment";

-- DropEnum
DROP TYPE "public"."CommonerAttachmentKind";

-- CreateIndex
CREATE INDEX "Attachment_commonerId_createdAt_idx" ON "Attachment"("commonerId", "createdAt");

-- CreateIndex
CREATE INDEX "Attachment_applicationId_createdAt_idx" ON "Attachment"("applicationId", "createdAt");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_commonerId_fkey" FOREIGN KEY ("commonerId") REFERENCES "CommonerRegistration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_commonerId_fkey" FOREIGN KEY ("commonerId") REFERENCES "CommonerRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
