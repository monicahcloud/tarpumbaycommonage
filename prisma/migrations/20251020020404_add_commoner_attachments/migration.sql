-- CreateEnum
CREATE TYPE "CommonerAttachmentKind" AS ENUM ('ID_PASSPORT', 'BIRTH_CERT', 'PROOF_OF_LINEAGE', 'PROOF_OF_ADDRESS', 'OTHER');

-- CreateTable
CREATE TABLE "CommonerAttachment" (
    "id" TEXT NOT NULL,
    "commonerId" TEXT NOT NULL,
    "kind" "CommonerAttachmentKind" NOT NULL,
    "url" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "label" TEXT,
    "pathname" TEXT,

    CONSTRAINT "CommonerAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommonerAttachment_commonerId_createdAt_idx" ON "CommonerAttachment"("commonerId", "createdAt");

-- AddForeignKey
ALTER TABLE "CommonerAttachment" ADD CONSTRAINT "CommonerAttachment_commonerId_fkey" FOREIGN KEY ("commonerId") REFERENCES "CommonerRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
