-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "alreadyHasLand" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Application_commonerId_idx" ON "Application"("commonerId");
