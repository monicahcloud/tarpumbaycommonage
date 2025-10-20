-- CreateEnum
CREATE TYPE "CommonerStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "additionalInfo" TEXT,
ADD COLUMN     "signDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "CommonerRegistration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "CommonerStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "dob" TIMESTAMP(3),
    "address" TEXT NOT NULL,
    "ancestry" TEXT,
    "agreeRules" BOOLEAN NOT NULL,
    "signature" TEXT NOT NULL,
    "signDate" TIMESTAMP(3),

    CONSTRAINT "CommonerRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommonerRegistration_userId_key" ON "CommonerRegistration"("userId");

-- CreateIndex
CREATE INDEX "CommonerRegistration_status_submittedAt_idx" ON "CommonerRegistration"("status", "submittedAt");

-- AddForeignKey
ALTER TABLE "CommonerRegistration" ADD CONSTRAINT "CommonerRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
